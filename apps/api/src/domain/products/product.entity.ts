import { PRODUCT_TYPES, type ProductType } from '@cafe-da-fisica/shared';
import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../../infrastructure/database/transformers.js';
import { OrderItem } from '../orders/order-item.entity.js';

@Entity({ name: 'products' })
@Check('CHK_products_price_positive', '"price" > 0')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, transformer: decimalTransformer })
    price: number;

    /** Listed in the menu. Hidden products still exist for past orders. */
    @Column({ type: 'boolean', default: true })
    shown: boolean;

    /** Can currently be ordered (e.g. not sold out). */
    @Column({ type: 'boolean', default: true })
    available: boolean;

    @Column({ type: 'enum', enum: PRODUCT_TYPES, enumName: 'product_type', default: 'other' })
    type: ProductType;

    @Column({ type: 'boolean', default: false })
    vegan: boolean;

    @Column({ type: 'text', name: 'image_url', nullable: true })
    imageUrl: string | null;

    @OneToMany(() => OrderItem, (item) => item.product)
    orderItems: OrderItem[];
}
