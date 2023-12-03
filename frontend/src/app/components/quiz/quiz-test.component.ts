import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz, Question } from '../../models/quiz';
import { MatDialog } from '@angular/material/dialog';
import { QuizService } from 'src/app/services/quiz.service';
import { StateService } from 'src/app/services/state.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';


@Component({
  selector: 'quiz-test',
  templateUrl: './quiz-test.component.html'
})

export class QuizTestComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nom', 'dataBase', 'startDate', 'endDate','statut','evaluation' ,'actions'];
  displayedColumnsTp: string[] = ['nom', 'dataBase','statut' ,'actions'];
  dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
  dataSourceTp: MatTableDataSource<Quiz> = new MatTableDataSource();
  dataSourceTest: MatTableDataSource<Quiz> = new MatTableDataSource();
  state: MatTableState;
  filter: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) sortTest!: MatSort;
  @ViewChild('paginatorTp') paginatorTp!: MatPaginator;
  @ViewChild(MatPaginator) paginatorTest!: MatPaginator;

  constructor(
    private quizService: QuizService,
    private stateService: StateService,
    private authService: AuthenticationService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.state = this.stateService.quizTestListState;

  }


  // appelée quand on clique sur le bouton "edit"
  edit(question: Question) {
    var id = question.id;
    console.log("edit" +" ---> :"+ question.body?.toString());
    this.router.navigate(['/question/', id]);
  }

  ngOnInit(): void {
      this.refresh();
  }

  get showTpBlock(): boolean {
    console.log("teeeeeesssst" + this.dataSource.data.some(row => row.isTest));
    return this.dataSourceTp.data.some(row => !row.isTest);
  }

  get showTestBlock(): boolean {
    return this.dataSourceTest.data.some(row => row.isTest);
  }

  ngAfterViewInit(): void {
    // lie le datasource au sorter et au paginator pour les TP
    this.dataSourceTp.paginator = this.paginator;
    this.dataSourceTp.sort = this.sort;
    if (this.sort) {
        this.state.bind(this.dataSourceTp);
    }


    // lie le datasource au sorter et au paginator pour les Tests
    this.dataSourceTest.paginator = this.paginatorTest;
    this.dataSourceTest.sort = this.sortTest;
    if (this.sortTest) {
        this.state.bind(this.dataSourceTest);
    }

    // récupère les données
    this.refresh();
}

  refresh() {
    this.quizService.getAll().subscribe(quizes => {
      // assigne toutes les données récupérées au datasource
      this.dataSource.data = quizes;

      this.dataSourceTest.data = quizes;

      // Filtrer les données pour les TP
      this.dataSourceTp.data = this.dataSource.data.filter(row => !row.isTest);

      // Filtrer les données pour les Tests
      this.dataSourceTest.data = this.dataSource.data.filter(row => row.isTest);

      // restaure l'état du datasource (tri et pagination) à partir du state pour les TP
      //this.state.restoreState(this.dataSourceTp);

      // restaure l'état du datasource (tri et pagination) à partir du state pour les Tests
      //this.state.restoreState(this.dataSourceTest);

      // restaure l'état du filtre à partir du state
      this.filter = this.state.filter;
    });
  }

}
