import { Component } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { addIcons } from 'ionicons';
import { trashOutline, bagHandleOutline, cardOutline, logoPaypal, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab2Page {
  // Controla qué opción está resaltada
  metodoSeleccionado: string = ''; 

  constructor(
    public cartService: CartService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    // Registrar iconos necesarios
    addIcons({ trashOutline, bagHandleOutline, cardOutline, logoPaypal, checkmarkCircle });
  }

  get totalCarrito() {
    return this.cartService.cartItems.reduce((acc, item) => acc + item.precio, 0).toFixed(2);
  }

  seleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
  }

  async realizarPago() {
    // Validar que haya elegido algo
    if (!this.metodoSeleccionado) {
      const alert = await this.alertCtrl.create({
        header: 'Atención',
        message: 'Por favor, selecciona un método de pago antes de continuar.',
        buttons: ['ENTENDIDO']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.metodoSeleccionado === 'paypal' ? 'Conectando con PayPal...' : 'Procesando tarjeta...',
      spinner: 'crescent'
    });
    await loading.present();

    const nuevaOrden = {
      id: Math.floor(1000 + Math.random() * 9000),
      fecha: new Date().toLocaleDateString(),
      total: this.totalCarrito,
      articulos: this.cartService.cartItems.length,
      productos: this.cartService.cartItems.map(item => ({ ...item })),
      metodo: this.metodoSeleccionado
    };

    setTimeout(async () => {
      // Guardar en historial y notificaciones
      await this.cartService.saveOrder(nuevaOrden);
      await this.cartService.addNotification('¡Compra Exitosa!', `Pedido #${nuevaOrden.id} pagado con ${this.metodoSeleccionado.toUpperCase()}.`);
      await this.cartService.clearCart();
      
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'PAGO CONFIRMADO',
        message: 'Tu compra se ha realizado con éxito.',
        buttons: ['LISTO']
      });
      await alert.present();
      this.metodoSeleccionado = ''; // Limpiar selección tras el pago
    }, 2000);
  }

  async eliminarItem(index: number) {
    this.cartService.cartItems.splice(index, 1);
    await this.cartService._storage?.set(`carrito_${this.cartService.currentUserId}`, this.cartService.cartItems);
  }

  usarImagenFallback(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'assets/image-placeholder.svg';
  }
}
