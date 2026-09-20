import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { decimalTransformer } from '../database/transformers.js';
import { Product } from '../products/product.entity.js';
import { Order } from './order.entity.js';

// One line of an order. The price is copied from the product at order time so later price
// changes do not rewrite history.
@Entity({ name: 'order_items' })
@Check('CHK_order_items_quantity_positive', '"quantity" > 0')
export class OrderItem {
    @PrimaryColumn({ type: 'integer', name: 'order_id' })
    orderId: number;

    @PrimaryColumn({ type: 'integer', name: 'product_id' })
    productId: number;

    @Column({ type: 'integer' })
    quantity: number;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        name: 'unit_price',
        transformer: decimalTransformer,
    })
    unitPrice: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, (product) => product.orderItems)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
