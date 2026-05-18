import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public _storage: Storage | null = null;
  public cartItems: any[] = [];
  public currentUserId: string = 'invitado';

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.loadCart();
  }

  async setUserId(email: string) {
    this.currentUserId = email;
    await this.loadCart();
  }

  async loadCart() {
    const key = `carrito_${this.currentUserId}`;
    const savedCart = await this._storage?.get(key);
    this.cartItems = savedCart ? savedCart : [];
  }

  async addToCart(product: any) {
    this.cartItems.push(product);
    await this._storage?.set(`carrito_${this.currentUserId}`, this.cartItems);
  }

  async clearCart() {
    this.cartItems = [];
    await this._storage?.set(`carrito_${this.currentUserId}`, []);
  }

  // --- HISTORIAL ---
  async saveOrder(order: any) {
    const key = `ordenes_${this.currentUserId}`;
    const orders = (await this._storage?.get(key)) || [];
    orders.unshift(order); 
    await this._storage?.set(key, orders);
  }

  async getOrders() {
    const key = `ordenes_${this.currentUserId}`;
    return (await this._storage?.get(key)) || [];
  }

  // --- NOTIFICACIONES ---
  async getNotifications() {
    const key = `notificaciones_${this.currentUserId}`;
    return (await this._storage?.get(key)) || [];
  }

  async addNotification(title: string, msg: string) {
    const key = `notificaciones_${this.currentUserId}`;
    const notifications = (await this._storage?.get(key)) || [];
    notifications.unshift({
      title, msg,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    await this._storage?.set(key, notifications);
  }
}