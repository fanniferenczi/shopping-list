import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ShoppingItem } from '../models/shopping-item.interface';

@Injectable({
    providedIn: 'root'
})
export class ShoppingListService {
    private items: ShoppingItem[] = [];
    private itemsSubject = new BehaviorSubject<ShoppingItem[]>([]);

    constructor() {}

    getItems(): Observable<ShoppingItem[]> {
        return this.itemsSubject.asObservable();
    }

    addItem(name: string): void {
        const newItem: ShoppingItem = {
            id: Date.now(),
            name,
            bought: false
        };
        this.items.push(newItem);
        this.itemsSubject.next([...this.items]);
    }

    toggleItemStatus(id: number): void {
        const itemIndex = this.items.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        const item = this.items[itemIndex];
        const updatedItem = { ...item, bought: !item.bought };
        
        // Remove the item from its current position
        this.items.splice(itemIndex, 1);
        
        if (updatedItem.bought) {
            // If item is marked as bought, add it to the beginning of the array
            this.items.unshift(updatedItem);
        } else {
            // If item is unmarked, add it back to the end of non-bought items
            const lastNonBoughtIndex = this.items.findIndex(i => i.bought);
            if (lastNonBoughtIndex === -1) {
                // If no bought items, add to end
                this.items.push(updatedItem);
            } else {
                // Insert before first bought item
                this.items.splice(lastNonBoughtIndex, 0, updatedItem);
            }
        }
        
        this.itemsSubject.next([...this.items]);
    }
}