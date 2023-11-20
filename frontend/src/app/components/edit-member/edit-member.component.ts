import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { UserService } from '../../services/member.service';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash-es';
import { User, Role } from 'src/app/models/member';
import { differenceInCalendarYears, differenceInYears, sub } from 'date-fns';


@Component({
    selector: 'app-edit-member-mat',
    templateUrl: './edit-member.component.html',
    styleUrls: ['./edit-member.component.css']
})
export class EditMemberComponent {
    public frm!: FormGroup;
    public ctlPseudo!: FormControl;
    public ctlEmail!: FormControl;
    public ctlFirstName!: FormControl;
    public ctlLastName!: FormControl;
    public ctlPassword!: FormControl;
    public ctlBirthDate!: FormControl;
    public ctlRole!: FormControl;
    public isNew: boolean;
    public maxDate = sub(new Date(), { years: 18 });

    constructor(public dialogRef: MatDialogRef<EditMemberComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { member: User; isNew: boolean; },
        private fb: FormBuilder,
        private memberService: UserService
    ) {
        this.ctlPseudo = this.fb.control('', [
            Validators.required,
            Validators.minLength(3),
            this.forbiddenValue('abc')
        ], [this.pseudoUsed()]);
        this.ctlEmail = this.fb.control('', [
            Validators.required,
            Validators.email
        ]);
        this.ctlPassword = this.fb.control('', data.isNew ? [Validators.required, Validators.minLength(3)] : []);
        this.ctlFirstName = this.fb.control(null, [Validators.minLength(3)]);
        this.ctlLastName = this.fb.control(null, [Validators.minLength(3)]);
        this.ctlBirthDate = this.fb.control(null, [this.validateBirthDate()]);
        this.ctlRole = this.fb.control(Role.Student, []);
        this.frm = this.fb.group({
            pseudo: this.ctlPseudo,
            email: this.ctlEmail,
            password: this.ctlPassword,
            firstName: this.ctlFirstName,
            lastName: this.ctlLastName,
            birthDate: this.ctlBirthDate,
            role: this.ctlRole
        });

        this.isNew = data.isNew;
        this.frm.patchValue(data.member);
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

    validateBirthDate(): any {
        return (ctl: FormControl) => {
            const birthDate: Date = ctl.value;
            const today = new Date();
            if (today < birthDate)
                return { futureBorn: true }
            var age = differenceInYears(today, birthDate);
            if (age < 18)
                return { tooYoung: true };
            return null;
        };
    }

    // Validateur asynchrone qui vérifie si le pseudo n'est pas déjà utilisé par un autre membre
    pseudoUsed(): any {
        let timeout: NodeJS.Timeout;
        return (ctl: FormControl) => {
            clearTimeout(timeout);
            const pseudo = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (ctl.pristine) {
                        resolve(null);
                    } else {
                        this.memberService.getById(pseudo).subscribe(member => {
                            resolve(member ? { pseudoUsed: true } : null);
                        });
                    }
                }, 300);
            });
        };
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    update() {
        console.log('Update function called:', this.frm.value);
        this.dialogRef.close(this.frm.value);
    }

    cancel() {
        this.dialogRef.close();
    }
}
