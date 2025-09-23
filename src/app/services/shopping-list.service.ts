import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { ShoppingItem } from '../models/shopping-item.interface';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private collectionName = 'shopping-items';
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private docRef = (id: string) => doc(this.collectionRef, id);

  // create the collectionRef during initialization (DI context)
  private collectionRef = collection(this.firestore, this.collectionName);

  // CALL collectionData() here (during service initialization) so it's inside the injection context
  private items$ = collectionData(query(this.collectionRef, orderBy('lastModifiedAt', 'desc')), {
    idField: 'id',
  }).pipe(
    map((items) => items as ShoppingItem[]),
    map((items) =>
      items.sort((a, b) => {
        if (a.bought !== b.bought) {
          return a.bought ? 1 : -1;
        }
        return b.lastModifiedAt - a.lastModifiedAt;
      })
    )
  );

  // keep API simple — return the already-created observable
  getItems(): Observable<ShoppingItem[]> {
    return this.items$;
  }

  async addItem(name: string): Promise<void> {
    const now = Date.now();
    await addDoc(this.collectionRef, {
      name,
      bought: false,
      timestamp: now,
      lastModifiedBy: this.authService.getUserId(),
      lastModifiedAt: now,
    });
  }

  async toggleItemStatus(id: string): Promise<void> {
    const docRef = this.docRef(id);

    const item = await firstValueFrom(
      this.getItems().pipe(map((items) => items.find((item) => item.id === id)))
    );

    if (item) {
      await updateDoc(docRef, {
        bought: !item.bought,
        lastModifiedBy: this.authService.getUserId(),
        lastModifiedAt: Date.now(),
      });
    }
  }

  async deleteItem(id: string): Promise<void> {
    const docRef = this.docRef(id);
    await deleteDoc(docRef);
  }
}
