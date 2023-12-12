import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy, Input, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz, Question } from '../../models/quiz';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {FloatLabelType, MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'quiz-edition',
  templateUrl: './quiz-edition.component.html',
  styleUrls: ['./quiz-edition.component.css']
})

export class QuizEditionComponent implements OnInit{
  public frm!: FormGroup;
  public ctlName!: FormControl;
  public ctlDescription!: FormControl;
  public ctlRadioTrainning!: FormControl;
  public ctlRadioTest!: FormControl;
  public ctlDataBase!: FormControl;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private quizService: QuizService,
  ){
    this.ctlName = this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
      this.forbiddenValue('abc')
    ]);
    this.ctlDescription = this.fb.control('', []);
    this.ctlRadioTrainning = this.fb.control('', []);
    this.ctlRadioTest = this.fb.control('', []);
    this.ctlDataBase = this.fb.control('', []);
    this.frm = this.fb.group({
      name: this.ctlName,
      description: this.ctlDescription,
      radioTrainning: this.ctlRadioTrainning,
      radioTest: this.ctlRadioTest,
      dataBase: this.ctlDataBase,
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const quizId = +params['id'];
      // l'ID de la question actuelle
      this.quizService.getOne(quizId).subscribe(quiz => {
        this.ctlName.setValue(quiz?.name);
        console.log('!!$!$!$!$!$$!  Quiz NAME:', quiz?.name);
      });
    });
  }

  // Validateur bidon qui vérifie que la valeur est différente
  forbiddenValue(val: string): any {
    return (ctl: FormControl) => {
        if (ctl.value === val) {
            return { forbiddenValue: { currentValue: ctl.value, forbiddenValue: val } };
        }
        return null;
    };
  }

}
