import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private publishTenderModalOpen = new BehaviorSubject<boolean>(false);
  
  publishTenderModal$ = this.publishTenderModalOpen.asObservable();

  openPublishTenderModal(): void {
    this.publishTenderModalOpen.next(true);
  }

  closePublishTenderModal(): void {
    this.publishTenderModalOpen.next(false);
  }
}
