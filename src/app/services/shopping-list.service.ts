import { inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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
import { AuthService } from './auth.service';
import { ShoppingItem } from '../models/shopping-item.interface';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private collectionName = 'shopping-items';
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private collectionRef = collection(this.firestore, this.collectionName);
  private docRef = (id: string) => doc(this.collectionRef, id);

  // Observable that waits for auth before querying Firestore
  getItems(): Observable<ShoppingItem[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) return []; // return empty until auth ready
        const q = query(this.collectionRef, orderBy('lastModifiedAt', 'desc'));
        return collectionData(q, { idField: 'id' });
      }),
      map((items: any[]) => items as ShoppingItem[]),
      map((items) =>
        items.sort((a, b) => {
          if (a.bought !== b.bought) {
            return a.bought ? 1 : -1;
          }
          return b.lastModifiedAt - a.lastModifiedAt;
        })
      )
    );
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
