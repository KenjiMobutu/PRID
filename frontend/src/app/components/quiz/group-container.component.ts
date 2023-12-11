import { Component, OnInit, ViewChild,  AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz } from '../../models/quiz';
import { StateService } from 'src/app/services/state.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { QuizService } from 'src/app/services/quiz.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'group-container',
    templateUrl: './group-container.component.html'
})

export class QuizesContainerComponent implements OnInit, AfterViewInit{
  filter: string = '';
  dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
  state: MatTableState;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private quizService: QuizService,
        private stateService: StateService,
        private authService: AuthenticationService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar
    ) {
        this.state = this.stateService.quizTestListState;
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
      //const event = new KeyboardEvent('input', {bubbles : true, cancelable : true, key : " "});
      //Object.defineProperty(event, 'target', {writable: false, value: {value: this.filter}});
      //this.filterChanged(event);


    }


  // appelée chaque fois que le filtre est modifié par l'utilisateur
filterChanged(e: KeyboardEvent) {
  const filterValue = (e.target as HTMLInputElement).value;
  // applique le filtre au datasource (et provoque l'utilisation du filterPredicate)
  this.dataSource.filter = filterValue.trim().toLowerCase();
  // Définir le filterPredicate pour rechercher dans plusieurs propriétés

  console.log('---> this.dataSource.filter', this.dataSource.filter);
  console.log('---> this.dataSource', this.dataSource);
  // sauve le nouveau filtre dans le state
  this.state.filter = this.dataSource.filter;
  //this.filter = this.state.filter;
  this.filter = filterValue;
  //this.state.bind(this.dataSource);
  console.log('---> this.filter', this.filter);
  // comme le filtre est modifié, les données aussi et on réinitialise la pagination
  // en se mettant sur la première page
  //if (this.dataSource.paginator)
    //this.dataSource.paginator.firstPage();
}


}


