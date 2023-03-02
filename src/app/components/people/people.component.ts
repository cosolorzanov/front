import {Component, Inject} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {PersonModel} from "../../models/person.model";
import {MainService} from "../../services/main.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Document_typeModel} from "../../models/document_type.model";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent {

  displayedColumns: string[] = ['id', 'creationDate', 'names', 'options'];
  dataSource  = new MatTableDataSource<PersonModel>([]);

  constructor(private apiService:MainService, public dialog: MatDialog ) {  }

  ngOnInit() {
    this.getPeople();
  }

  getPeople(){
    this.apiService.getPeople().subscribe((response) =>{
      this.dataSource.data = response;

    })
  }

  view() {

  }

  edit() {

  }

  remove() {

  }

  addPerson() {
    const dialogRef = this.dialog.open(DialogAddPerson, {
      data: {
        method: "Adicionar",
        data: {}
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
export class DialogAddPerson {

  myForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<DialogAddPerson>,private apiService:MainService, @Inject(MAT_DIALOG_DATA) public data:any, private fb: FormBuilder) {
    this.myForm = this.fb.group({
      docType: ['', Validators.required],
      docNumber: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      birthdate: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }
  documentTypes : Document_typeModel[] = [];

  ngOnInit() {
    this.getDocumentTypes();
  }
  getDocumentTypes(){
    this.apiService.getDocumentTypes().subscribe((response) =>{
      this.documentTypes = response;
    })
  }

  onSubmit() {
    // @ts-ignore
    const personData: PersonModel = {
      documentTypeId: this.myForm.get('docType')!.value,
      documentNumber: this.myForm.get('docNumber')!.value,
      firstName: this.myForm.get('firstName')!.value,
      lastName: this.myForm.get('lastName')!.value,
      address: this.myForm.get('address')!.value,
      birthDate: this.myForm.get('birthdate')!.value,
      phone: this.myForm.get('phone')!.value,
    };
    this.apiService.addPerson(personData).subscribe(response =>{
            alert("Persona guardada con exito. ");
            },
      err => alert("Lo sentimos,ha sucedido un error "+err),
      () => {
        console.log('Proceso terminado');
        this.dialogRef.close(true);
    });
  }
}
