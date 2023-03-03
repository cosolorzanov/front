import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {PersonModel} from "../../models/person.model";
import {MainService} from "../../services/main.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Document_typeModel} from "../../models/document_type.model";
import {TitleModel} from "../../models/title.model";
import {MatSort, MatSortable, Sort} from "@angular/material/sort";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit, AfterViewInit{

  displayedColumns: string[] = ['id', 'creationDate', 'names', 'options'];
  dataSource  = new MatTableDataSource<PersonModel>([]);
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(private apiService:MainService, public dialog: MatDialog ) {
    console.log(this.sort)
  }

  ngOnInit() {
    this.getPeople();
  }
  ngAfterViewInit() {
    const sortState: Sort = {active: 'creationDate', direction: 'desc'};
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.dataSource.sort = this.sort;
  }

  getPeople(){
    this.apiService.getPeople().subscribe((response) =>{
      this.dataSource.data = response;
    })
  }

  view() {

  }

  edit(person:PersonModel) {
    const dialogRef = this.dialog.open(DialogAddPerson, {
      data: {
        method: "Editar",
        dataPerson: person
      },
    });

    dialogRef.afterClosed().subscribe((result:boolean) => {
      if( result) this.getPeople();
    });
  }

  remove(personId:number) {
    this.apiService.deletePerson(personId).subscribe( (data) =>{
        alert("Persona con ID "+personId+" borrada con exito.");
        this.getPeople();
      }
    )
  }

  addPerson() {
    const dialogRef = this.dialog.open(DialogAddPerson, {
      data: {
        method: "Adicionar",
        dataPerson: {}
      },
    });

    dialogRef.afterClosed().subscribe((result:boolean) => {
      if( result) this.getPeople();
    });
  }
}

@Component({
  selector: 'dialog-add-person',
  templateUrl: 'dialog-add-person.html',
})
export class DialogAddPerson implements OnInit{

  myForm: FormGroup;
  formTitles: FormGroup;
  dataSource = new MatTableDataSource<TitleModel>([]);
  deletedTitles: TitleModel[] = [];
  displayedColumns: string[] = ['titleName', 'level', 'institution', 'dateObtained', 'options'];

  constructor(public dialogRef: MatDialogRef<DialogAddPerson>,private apiService:MainService, @Inject(MAT_DIALOG_DATA) public data:any, private fb: FormBuilder) {

    this.myForm = this.fb.group({
      documentTypeId: ['', Validators.required],
      documentNumber: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      phone: ['', Validators.required]
    });

    this.formTitles = new FormGroup({
      titleName: new FormControl('',Validators.required),
      level: new FormControl('',Validators.required),
      institution: new FormControl('', Validators.required),
      dateObtained: new FormControl('', Validators.required)
    });

  }
  documentTypes : Document_typeModel[] = [];
  maxDate: Date = new Date ();

  ngOnInit() {
    this.getDocumentTypes();
    if (this.data.method === 'Editar'){
      this.myForm.patchValue(this.data.dataPerson);
      let d = new Date(this.data.dataPerson.birthDate);
      d.setMinutes( d.getMinutes() + d.getTimezoneOffset() );
      this.myForm.patchValue({birthDate:d})

      this.getTitles(this.data.dataPerson.id);
    }
  }

  getTitles(personId: number){
    this.apiService.getTitles(personId).subscribe( (data) =>{
      this.dataSource = new MatTableDataSource<TitleModel>(data);
    })
  }
  getDocumentTypes(){
    this.apiService.getDocumentTypes().subscribe((response) =>{
      this.documentTypes = response;
    })
  }

  onSubmit() {
    // @ts-ignore
    const personData: PersonModel = {
      documentTypeId: this.myForm.get('documentTypeId')!.value,
      documentNumber: this.myForm.get('documentNumber')!.value,
      firstName: this.myForm.get('firstName')!.value,
      lastName: this.myForm.get('lastName')!.value,
      address: this.myForm.get('address')!.value,
      birthDate: this.myForm.get('birthDate')!.value,
      phone: this.myForm.get('phone')!.value,
    };
    if(this.myForm.valid)
    if (this.data.method === 'Editar'){
      personData.id = this.data.dataPerson.id;
      this.apiService.editPerson(personData).subscribe(response => {
          this.updateTitles(response.id);
          alert("Persona con ID "+response.id+" editada con exito.");
        },
        err => alert("Ha sucedido un error " + err),
        () => {
          console.log('Proceso terminado');
          this.dialogRef.close(true);
        });
    }else {
      this.apiService.addPerson(personData).subscribe(response => {
          this.updateTitles(response.id);
          alert("Persona con ID "+response.id+" guardada con exito. ");
        },
        err => alert("Ha sucedido un error " + err),
        () => {
          console.log('Proceso terminado');
          this.dialogRef.close(true);
        });
    }
  }

  addTitlesToDS() {
    if(this.formTitles.valid){
      this.dataSource.data.push(this.formTitles.value);
      this.dataSource._updateChangeSubscription();
    }

  }

  removeTitleToDS(title:TitleModel) {
    this.dataSource.data.splice(this.dataSource.data.indexOf(title), 1);
    this.dataSource._updateChangeSubscription();
    this.deletedTitles.push(title);
  }

  updateTitles(personId:number){
    console.log("Saving titles")
    console.log(this.dataSource.data)
    this.dataSource.data.forEach( (v,i,a) => {
      let aux = v;
      aux.personId = personId
      this.apiService.addTitle(aux).subscribe( (data =>{
        console.log("titulo agregado "+data)
      }));
    })
    this.deletedTitles.forEach((v,i,a) => {
      this.apiService.deleteTitle(v.id).subscribe( (data =>{
        console.log("titulo eliminado "+ data)
      }));
    })
  }
}
