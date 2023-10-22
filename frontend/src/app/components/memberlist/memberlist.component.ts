import { Component } from '@angular/core';
import { User } from '../../models/member';
import { UserService } from '../../services/member.service';

@Component({
    selector: 'app-memberlist',
    templateUrl: './memberlist.component.html'
})
export class MemberListComponent {
    members: User[] = [];

    constructor(private memberService: UserService) {
        memberService.getAll().subscribe(members => {
            this.members = members;
        })
    }
}
