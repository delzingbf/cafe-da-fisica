import { Admin } from '../../domain/admins/admin.entity.js';
import { OrderItem } from '../../domain/orders/order-item.entity.js';
import { Order } from '../../domain/orders/order.entity.js';
import { Product } from '../../domain/products/product.entity.js';
import { Settings } from '../../domain/settings/settings.entity.js';

// Every entity, listed explicitly (globs break class identity under ESM/Vitest).
// Add new entities here — both the Nest module and the TypeORM CLI read this list.
export const entities = [Product, Order, OrderItem, Admin, Settings];
