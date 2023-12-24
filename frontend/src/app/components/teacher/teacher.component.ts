import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy, Input } from '@angular/core';
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
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'teacher',
  templateUrl: './teacher.component.html'

})

export class TeacherComponent implements AfterViewInit {
  displayedColumns: string[] = ['nom', 'dataBase', 'type' ,'statut','startDate', 'endDate',  'actions'];
  dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
  filter: string = '';
  state: MatTableState;
  private _isTest?: boolean;
  private user : number | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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

  ngAfterViewInit(): void {
    this.user = this.authService.currentUser?.id;
    // lie le datasource au sorter et au paginator
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
      const str = data.name + ' ' + data.database?.name + ' ' + data.statusAsString + ' ';
      console.log('---> Database', data.database);
      console.log('---> str', str);
      return str.toLowerCase().includes(filter.toLowerCase());
    };

    this.state.bind(this.dataSource);
    // récupère les données
    this.refresh();
  }

  // appelée chaque fois que le filtre est modifié par l'utilisateur
  filterChanged(e: KeyboardEvent) {
    const filterValue = (e.target as HTMLInputElement).value;
    // applique le filtre au datasource (et provoque l'utilisation du filterPredicate)
    this.dataSource.filter = filterValue.trim().toLowerCase();
    // sauve le nouveau filtre dans le state
    this.state.filter = this.dataSource.filter;
    // comme le filtre est modifié, les données aussi et on réinitialise la pagination
    // en se mettant sur la première page
    if (this.dataSource.paginator)
        this.dataSource.paginator.firstPage();
  }

  // appelée quand on clique sur le bouton "edit"
  edit(quiz: Quiz) {
    const quizId = quiz.id ?? 0;
    this.quizService.getOne(quizId).subscribe(quiz => {
      if (quiz) {
        this.router.navigate(['/quiz-edition/', quizId]);
      }
    });
  }

  refresh() {
    this.quizService.getAll().subscribe(quizes => {
      // assigne toutes les données récupérées au datasource
      this.dataSource.data = quizes;
      this.state.restoreState(this.dataSource);
      // restaure l'état du filtre à partir du state
      this.filter = this.state.filter;
    });
  }


}
