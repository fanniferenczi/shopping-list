import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ShoppingListService } from '../services/shopping-list.service';
import { ShoppingItem } from '../models/shopping-item.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  template: `
    <div class="shopping-list">
      <div class="header-container">
        <h2>Shopping List</h2>
        <div class="countdown">
          <span class="countdown-text"
            >{{ daysUntilNovember14 }} days until Tour de Chambre! 🥳</span
          >
        </div>
      </div>

      <div class="add-item">
        <input
          #itemInput
          type="text"
          placeholder="Add new item"
          (keyup.enter)="addItem(itemInput.value); itemInput.value = ''"
        />
        <button (click)="addItem(itemInput.value); itemInput.value = ''">Add</button>
      </div>

      <div class="lists-container">
        <div class="pending-items">
          <h3>Items to Buy</h3>
          <ul>
            @for (item of pendingItems; track item.id) {
            <li>
              {{ item.name }}
              <div class="button-group">
                <button (click)="deleteItem(item.id)" class="icon-btn">
                  <mat-icon>delete</mat-icon>
                </button>
                <button (click)="toggleItem(item.id)" class="icon-btn-toggle">
                  <mat-icon class="done">done</mat-icon>
                </button>
              </div>
            </li>
            }
          </ul>
          <mat-paginator
            [length]="pendingItemsCount"
            [pageSize]="pageSize"
            [pageIndex]="pendingPageIndex"
            (page)="onPendingPageChange($event)"
            aria-label="Select page of pending items"
          >
          </mat-paginator>
        </div>

        <div class="bought-items">
          <h3>Already Bought</h3>
          <ul>
            @for (item of boughtItems; track item.id) {
            <li>
              <span class="bought">{{ item.name }}</span>
              <div class="button-group">
                <button (click)="deleteItem(item.id)" class="icon-btn">
                  <mat-icon>delete</mat-icon>
                </button>
                <button (click)="toggleItem(item.id)" class="icon-btn-toggle">
                  <mat-icon class="return">refresh</mat-icon>
                </button>
              </div>
            </li>
            }
          </ul>
          <mat-paginator
            [length]="boughtItemsCount"
            [pageSize]="pageSize"
            [pageIndex]="boughtPageIndex"
            (page)="onBoughtPageChange($event)"
            aria-label="Select page of bought items"
          >
          </mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shopping-list {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .header-container h2 {
        margin: 0;
      }

      .countdown {
        background-color: #f0f0f0;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #ddd;
      }

      .countdown-text {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      @media (max-width: 480px) {
        .header-container {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .countdown {
          align-self: flex-end;
        }
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
        background-color: #4caf50;
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
        background-color: #2196f3;
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

      li button.icon-btn-toggle {
        min-width: 0; /* remove default min-width */
        width: 28px; /* optional: fix size */
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #2196f3; /* blue for toggle */
      }

      .done {
        padding-right: 22px;
      }
      .return {
        padding-right: 24px;
      }

      li button.icon-btn {
        padding: 10px 4px 4px 4px; /* less padding than text buttons */
        min-width: 0; /* remove default min-width */
        width: 28px; /* optional: fix size */
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f44336; /* red for delete */
        border-radius: 50%; /* circular */
      }

      li button.icon-btn mat-icon {
        font-size: 16px; /* keep it small */
        display: block;
      }
      li .button-group {
        display: flex;
        gap: 12px; /* space between delete and toggle */
        align-items: center; /* vertically center buttons */
      }
    `,
  ],
})
export class ShoppingListComponent implements OnDestroy {
  items: ShoppingItem[] = [];
  pageSize = 10;
  pendingPageIndex = 0;
  boughtPageIndex = 0;
  daysUntilNovember14: number = 0;
  private countdownInterval: any;
  private visibilityChangeListener: any;

  constructor(private shoppingListService: ShoppingListService, private analytics: Analytics) {
    this.shoppingListService.getItems().subscribe((items) => {
      this.items = items;
    });
    this.calculateDaysUntilNovember14();
    this.setupCountdownUpdates();
  }

  ngOnDestroy(): void {
    // Clean up intervals and listeners to prevent memory leaks
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.visibilityChangeListener) {
      document.removeEventListener('visibilitychange', this.visibilityChangeListener);
    }
  }

  private setupCountdownUpdates(): void {
    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Update at midnight, then every 24 hours
    setTimeout(() => {
      this.calculateDaysUntilNovember14();
      this.countdownInterval = setInterval(() => {
        this.calculateDaysUntilNovember14();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    // Also update when user returns to the tab (in case they left it open for days)
    this.visibilityChangeListener = () => {
      if (!document.hidden) {
        this.calculateDaysUntilNovember14();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeListener);
  }
  private calculateDaysUntilNovember14(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    let november14 = new Date(currentYear, 10, 13); // Month is 0-indexed, so 10 = November, day 14 is the 13th

    // If November 14th has already passed this year, calculate for next year
    if (today > november14) {
      november14 = new Date(currentYear + 1, 10, 13);
    }

    const timeDiff = november14.getTime() - today.getTime();
    this.daysUntilNovember14 = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  get pendingItems(): ShoppingItem[] {
    const pending = this.items.filter((item) => !item.bought);
    const startIndex = this.pendingPageIndex * this.pageSize;
    return pending.slice(startIndex, startIndex + this.pageSize);
  }

  get boughtItems(): ShoppingItem[] {
    const bought = this.items.filter((item) => item.bought);
    const startIndex = this.boughtPageIndex * this.pageSize;
    return bought.slice(startIndex, startIndex + this.pageSize);
  }

  get pendingItemsCount(): number {
    return this.items.filter((item) => !item.bought).length;
  }

  get boughtItemsCount(): number {
    return this.items.filter((item) => item.bought).length;
  }

  onPendingPageChange(event: PageEvent): void {
    this.pendingPageIndex = event.pageIndex;
  }

  onBoughtPageChange(event: PageEvent): void {
    this.boughtPageIndex = event.pageIndex;
  }

  async addItem(name: string): Promise<void> {
    if (name.trim()) {
      await this.shoppingListService.addItem(name.trim());
      logEvent(this.analytics, 'add_item', { itemName: name.trim() });
    }
  }

  async toggleItem(id: string): Promise<void> {
    await this.shoppingListService.toggleItemStatus(id);
    logEvent(this.analytics, 'toggle_item', { itemId: id });
  }

  async deleteItem(id: string): Promise<void> {
    await this.shoppingListService.deleteItem(id);
    logEvent(this.analytics, 'delete_item', { itemId: id });
  }
}
