import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { th } from 'date-fns/locale';

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignUpComponent {
    public frm!: FormGroup;
    public submitted: boolean = false;
    public ctlEmail!: FormControl;
    public ctlFirstName!: FormControl;
    public ctlLastName!: FormControl;
    public ctlBirthDate!: FormControl;
    public ctlPseudo!: FormControl;
    public ctlProfile!: FormControl;
    public ctlPassword!: FormControl;
    public ctlPasswordConfirm!: FormControl;

    constructor(
        public authService: AuthenticationService,  // pour pouvoir faire le login
        public router: Router,                      // pour rediriger vers la page d'accueil en cas de login
        private fb: FormBuilder                     // pour construire le formulaire, du côté TypeScript
    ) {
        this.ctlPseudo = this.fb.control('', [Validators.required, Validators.minLength(3)], [this.pseudoUsed()]);
        this.ctlEmail = this.fb.control('', [Validators.required, Validators.email]);
        this.ctlFirstName = this.fb.control('', Validators.minLength(3));
        this.ctlLastName = this.fb.control('',  Validators.minLength(3));
        this.ctlBirthDate = this.fb.control('', [Validators.required]);
        this.ctlPassword = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlPasswordConfirm = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.frm = this.fb.group({
            pseudo: this.ctlPseudo,
            email: this.ctlEmail,
            firstName: this.ctlFirstName,
            lastName: this.ctlLastName,
            birthDate: this.ctlBirthDate,
            password: this.ctlPassword,
            passwordConfirm: this.ctlPasswordConfirm,
        }, { validator: this.crossValidations });
    }

    // Validateur asynchrone qui vérifie si le pseudo n'est pas déjà utilisé par un autre membre.
    // Grâce au setTimeout et clearTimeout, on ne déclenche le service que s'il n'y a pas eu de frappe depuis 300 ms.
    pseudoUsed(): AsyncValidatorFn {
        let timeout: NodeJS.Timeout;
        return (ctl: AbstractControl) => {
            clearTimeout(timeout);
            const pseudo = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    this.authService.isPseudoAvailable(pseudo).subscribe(res => {
                        resolve(res ? null : { pseudoUsed: true });
                    });
                }, 300);
            });
        };
    }

    crossValidations(group: FormGroup): ValidationErrors | null {
        if (!group.value) { return null; }
        return group.value.password === group.value.passwordConfirm ? null : { passwordNotConfirmed: true };
    }

    signup() {
        this.authService.signup(this.ctlPseudo.value, this.ctlEmail.value, this.ctlFirstName.value, this.ctlLastName.value, this.ctlBirthDate.value ,this.ctlPassword.value).subscribe(() => {
            if (this.authService.currentUser) {
                // Redirect the user
                this.router.navigate(['/']);
            }
        });
    }
}
