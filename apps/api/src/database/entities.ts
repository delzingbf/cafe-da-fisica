import { Admin } from '../admins/admin.entity.js';
import { OrderItem } from '../orders/order-item.entity.js';
import { Order } from '../orders/order.entity.js';
import { Product } from '../products/product.entity.js';
import { Settings } from '../settings/settings.entity.js';

// Every entity, listed explicitly (globs break class identity under ESM/Vitest).
// Add new entities here — both the Nest module and the TypeORM CLI read this list.
export const entities = [Product, Order, OrderItem, Admin, Settings];
