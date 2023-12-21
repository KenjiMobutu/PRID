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
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { TruncatePipe } from 'src/app/helpers/truncatePipe';
@Component({
  selector: 'quiz-edition',
  templateUrl: './quiz-edition.component.html',
  styleUrls: ['./quiz-edition.component.css']
})

export class QuizEditionComponent implements OnInit{
  public isNew: boolean = false;
  public isTest?: boolean;
  range = new FormGroup({
    ctlStart: new FormControl<Date | null>(null),
    ctlEnd: new FormControl<Date | null>(null),
  });
  public frm!: FormGroup;
  public ctlName!: FormControl;
  public ctlDescription!: FormControl;
  public ctlDataBase!: FormControl;
  public ctlRadioGroup!: FormControl;
  public ctlPublished!: FormControl;
  public ctlDateRange!: FormControl;
  public ctlStart!: FormControl;
  public ctlFinish!: FormControl;
  panelOpenState = false;
  questions: Question[] = [];
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
    this.ctlRadioGroup = this.fb.control('', []);
    this.ctlDataBase = this.fb.control('', []);
    this.ctlPublished = this.fb.control(false);
    this.ctlDateRange = this.fb.control('', []);
    this.ctlStart = this.fb.control('', []);
    this.ctlFinish = this.fb.control('', []);
    this.frm = this.fb.group({
      name: this.ctlName,
      description: this.ctlDescription,
      radioGroup: this.ctlRadioGroup,
      dataBase: this.ctlDataBase,
      published: this.ctlPublished,
      dateRange: this.ctlDateRange,
      start: this.ctlStart,
      finish: this.ctlFinish,
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const quizId = +params['id'];
      // l'ID de la question actuelle
      this.quizService.getOne(quizId).subscribe(quiz => {
        this.isTest = quiz?.isTest;
        this.ctlName.setValue(quiz?.name);
        this.ctlDescription.setValue(quiz?.description);
        this.ctlRadioGroup.setValue(quiz?.isTest ? 'test' : 'trainning');
        this.ctlPublished.setValue(quiz?.isPublished);
        this.ctlDataBase.setValue(quiz?.database.name);
        this.ctlDateRange.setValue(quiz?.start);
        this.ctlStart.setValue(quiz?.start);
        this.ctlFinish.setValue(quiz?.finish);
        console.log('--> Quiz NAME:', quiz?.name);
        console.log('--> isTest', this.isTest);
        console.log('--> RADIO:', this.ctlRadioGroup.value);
        console.log('--> Database:', quiz?.database.name);
        console.log('--> Range:', this.ctlDateRange.value);
        console.log('--> Start DATE:', this.ctlStart.value);
        console.log('--> End DATE:', this.ctlFinish.value);
        console.log('--> Quiz:', quiz);
        this.questions = quiz?.questions ?? [];
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
