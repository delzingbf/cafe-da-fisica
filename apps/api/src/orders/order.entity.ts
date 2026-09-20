import {
    ORDER_DELIVERY_METHODS,
    ORDER_PAYMENT_OPTIONS,
    ORDER_STATUSES,
    type OrderDeliveryMethod,
    type OrderPaymentOption,
    type OrderStatus,
} from '@cafe-da-fisica/shared';
import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EMAIL_CHECKS } from '../database/checks.js';
import { OrderItem } from './order-item.entity.js';

@Entity({ name: 'orders' })
@Check('CHK_orders_customer_email_format', EMAIL_CHECKS.format('customer_email'))
@Check('CHK_orders_customer_email_lowercase', EMAIL_CHECKS.lowercase('customer_email'))
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', name: 'customer_name' })
    customerName: string;

    @Column({ type: 'text', name: 'customer_email' })
    customerEmail: string;

    @Column({
        type: 'enum',
        enum: ORDER_PAYMENT_OPTIONS,
        enumName: 'order_payment_option',
        name: 'payment_option',
        default: 'pix',
    })
    paymentOption: OrderPaymentOption;

    @Column({ type: 'enum', enum: ORDER_STATUSES, enumName: 'order_status', default: 'pending' })
    status: OrderStatus;

    @Column({
        type: 'enum',
        enum: ORDER_DELIVERY_METHODS,
        enumName: 'order_delivery_method',
        name: 'delivery_method',
        default: 'delivery',
    })
    deliveryMethod: OrderDeliveryMethod;

    @Column({ type: 'text', name: 'delivery_location', nullable: true })
    deliveryLocation: string | null;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    // `cascade: ['insert']` lets `orderRepo.save({ ..., items: [...] })` persist the lines too.
    @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
    items: OrderItem[];
}
