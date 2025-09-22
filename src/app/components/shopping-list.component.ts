import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ShoppingListService } from '../services/shopping-list.service';
import { ShoppingItem } from '../models/shopping-item.interface';

@Component({
    selector: 'app-shopping-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatPaginatorModule],
    template: `
        <div class="shopping-list">
            <h2>Shopping List</h2>
            
            <div class="add-item">
                <input #itemInput type="text" placeholder="Add new item" 
                       (keyup.enter)="addItem(itemInput.value); itemInput.value = ''">
                <button (click)="addItem(itemInput.value); itemInput.value = ''">Add</button>
            </div>

            <div class="lists-container">
                <div class="pending-items">
                    <h3>Items to Buy</h3>
                    <ul>
                        @for (item of pendingItems; track item.id) {
                            <li>
                                {{ item.name }}
                                <button (click)="toggleItem(item.id)">✓</button>
                            </li>
                        }
                    </ul>
                    <mat-paginator
                        [length]="pendingItemsCount"
                        [pageSize]="pageSize"
                        [pageIndex]="pendingPageIndex"
                        (page)="onPendingPageChange($event)"
                        aria-label="Select page of pending items">
                    </mat-paginator>
                </div>

                <div class="bought-items">
                    <h3>Already Bought</h3>
                    <ul>
                        @for (item of boughtItems; track item.id) {
                            <li>
                                <span class="bought">{{ item.name }}</span>
                                <button (click)="toggleItem(item.id)">↩</button>
                            </li>
                        }
                    </ul>
                    <mat-paginator
                        [length]="boughtItemsCount"
                        [pageSize]="pageSize"
                        [pageIndex]="boughtPageIndex"
                        (page)="onBoughtPageChange($event)"
                        aria-label="Select page of bought items">
                    </mat-paginator>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .shopping-list {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .add-item {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }

        .add-item input {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .add-item button {
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .lists-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        ul {
            list-style: none;
            padding: 0;
        }

        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            border-bottom: 1px solid #eee;
        }

        li button {
            padding: 4px 8px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .bought {
            text-decoration: line-through;
            color: #666;
        }

        mat-paginator {
            background: transparent;
            margin-top: 10px;
        }
    `]
})
export class ShoppingListComponent {
    items: ShoppingItem[] = [];
    pageSize = 10;
    pendingPageIndex = 0;
    boughtPageIndex = 0;

    constructor(private shoppingListService: ShoppingListService) {
        this.shoppingListService.getItems().subscribe(items => {
            this.items = items;
        });
    }

    get pendingItems(): ShoppingItem[] {
        const pending = this.items.filter(item => !item.bought);
        const startIndex = this.pendingPageIndex * this.pageSize;
        return pending.slice(startIndex, startIndex + this.pageSize);
    }

    get boughtItems(): ShoppingItem[] {
        const bought = this.items.filter(item => item.bought);
        const startIndex = this.boughtPageIndex * this.pageSize;
        return bought.slice(startIndex, startIndex + this.pageSize);
    }

    get pendingItemsCount(): number {
        return this.items.filter(item => !item.bought).length;
    }

    get boughtItemsCount(): number {
        return this.items.filter(item => item.bought).length;
    }

    onPendingPageChange(event: PageEvent): void {
        this.pendingPageIndex = event.pageIndex;
    }

    onBoughtPageChange(event: PageEvent): void {
        this.boughtPageIndex = event.pageIndex;
    }

    addItem(name: string): void {
        if (name.trim()) {
            this.shoppingListService.addItem(name.trim());
        }
    }

    toggleItem(id: number): void {
        this.shoppingListService.toggleItemStatus(id);
    }
}