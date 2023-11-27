import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz } from '../../models/quiz';
import { MatDialog } from '@angular/material/dialog';
import { QuizService } from 'src/app/services/quiz.service';
import { StateService } from 'src/app/services/state.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as _ from 'lodash-es';

@Component({
  selector: 'quiz-test',
  templateUrl: './quiz-test.component.html'
})

export class QuizTestComponent {
  displayedColumns: string[] = ['nom', 'dataBase', 'startDate', 'endDate','statut','evaluation' ,'actions'];
  dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
  state: MatTableState;
  filter: string = '';

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

  // appelée quand on clique sur le bouton "edit" d'un membre
  // edit(quiz: Quiz) {
  //   const dlg = this.dialog.open(EditMemberComponent, { data: {quiz, isNew: false } });
  //   dlg.beforeClosed().subscribe(res => {
  //       if (res) {
  //           _.assign(quiz, res);
  //           this.quizService.update(quiz).subscribe(res => {
  //               if (!res) {
  //                   this.snackBar.open(`There was an error at the server. The update has not been done! Please try again.`, 'Dismiss', { duration: 10000 });
  //                   this.refresh();
  //               }
  //           });
  //       }
  //   });
  // }

  ngAfterViewInit(): void {
    // lie le datasource au sorter et au paginator
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // établit les liens entre le data source et l'état de telle sorte que chaque fois que
    // le tri ou la pagination est modifié l'état soit automatiquement mis à jour
    this.state.bind(this.dataSource);
    // récupère les données
    this.refresh();
}

  refresh() {
    this.quizService.getAll().subscribe(quizes => {
        // assigne les données récupérées au datasource
        this.dataSource.data = quizes;
        // restaure l'état du datasource (tri et pagination) à partir du state
        this.state.restoreState(this.dataSource);
        // restaure l'état du filtre à partir du state
        this.filter = this.state.filter;
    });
  }
}
