import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {PersonModel} from "../models/person.model";
import {Document_typeModel} from "../models/document_type.model";
import {TitleModel} from "../models/title.model";

@Injectable({
  providedIn: 'root'
})
export class MainService {

  private readonly API_ROUTES =
    {
      people:{
        list:   environment.API_URL+'/people/list',
        add:    environment.API_URL+'/people/add/',
        delete: (personId: number) => environment.API_URL+`/people/delete/${personId}`,
        update: environment.API_URL+'/people/update/'
      },
      titles:{
        list:   (personId: number) => environment.API_URL+`/titles/list/${personId}`,
        add:    environment.API_URL+'/titles/add/',
        delete: (titleId: number) => environment.API_URL+`/titles/delete/${titleId}`,
        update: environment.API_URL+'/titles/update'
      },
      document_types:{
        list:   environment.API_URL+'/document_type/list'
      }
    }


  constructor(private http: HttpClient) { }

  public getPeople(): Observable<any> {
    return this.http.get<PersonModel[]>(this.API_ROUTES.people.list);
  }

  public getDocumentTypes(){
    return this.http.get<Document_typeModel[]>(this.API_ROUTES.document_types.list);
  }

  public addPerson(body: PersonModel) {
    return this.http.post<PersonModel>(this.API_ROUTES.people.add,body);
  }

  editPerson(personData: PersonModel) {
    return this.http.post<PersonModel>(this.API_ROUTES.people.update,personData);
  }

  deletePerson(personId:number){
    return this.http.delete(this.API_ROUTES.people.delete(personId))
  }

  getTitles(personId:number){
    return this.http.get<TitleModel[]>(this.API_ROUTES.titles.list(personId))
  }

  deleteTitle(titleId:number){
    return this.http.delete(this.API_ROUTES.titles.delete(titleId));
  }

  public addTitle(title: TitleModel) {
    return this.http.post<TitleModel>(this.API_ROUTES.titles.add, title);
  }
}
