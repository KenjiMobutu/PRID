import { Injectable } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";

@Injectable({ providedIn: 'root' })
export class StateService {
    public memberListState = new MatTableState('pseudo', 'asc', 5);
    public quizTestListState = new MatTableState('nom', 'asc', 5);
}
