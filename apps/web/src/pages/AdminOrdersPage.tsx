import { useEffect, useRef, useState } from 'react';
import { ORDER_STATUSES, type OrderReportOrder, type OrderStatus } from '@cafe-da-fisica/shared';
import { ApiError, api } from '../api/client';
import { formatPrice } from '../utils/formatPrice';
import {
    ORDER_DELIVERY_LABELS,
    ORDER_PAYMENT_LABELS,
    ORDER_STATUS_LABELS,
} from '../utils/orderLabels';
import './styles/AdminReportPage.css';
import './styles/AdminOrdersPage.css';

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function errorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 401) {
        return 'Sua sessão expirou. Entre novamente para gerenciar as encomendas.';
    }
    if (error instanceof ApiError && error.status === 404) {
        return 'Esta encomenda não existe mais. Atualize a lista.';
    }
    return 'Não foi possível concluir a operação. Tente novamente.';
}

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderReportOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [revision, setRevision] = useState(0);
    const mutation = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        api.get<OrderReportOrder[]>('/orders', { signal: controller.signal })
            .then((data) => {
                if (!controller.signal.aborted) setOrders(data);
            })
            .catch((cause: unknown) => {
                if (!controller.signal.aborted) setError(errorMessage(cause));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [revision]);

    async function updateStatus(order: OrderReportOrder, status: OrderStatus) {
        if (mutation.current || status === order.status) return;
        mutation.current = true;
        setBusy(order.id);
        setError('');
        setNotice('');
        try {
            await api.patch<void>(`/orders/${order.id}/status`, { status });
            setOrders((current) =>
                current.map((item) => (item.id === order.id ? { ...item, status } : item)),
            );
            setNotice(`Status do pedido #${order.id} atualizado.`);
        } catch (cause) {
            setError(errorMessage(cause));
        } finally {
            mutation.current = false;
            setBusy(null);
        }
    }

    async function deleteOrder(order: OrderReportOrder) {
        if (
            mutation.current ||
            !window.confirm(
                `Excluir o pedido #${order.id} de ${order.customerName}? Esta ação é permanente e também remove o pedido do relatório.`,
            )
        )
            return;
        mutation.current = true;
        setBusy(order.id);
        setError('');
        setNotice('');
        try {
            await api.delete<void>(`/orders/${order.id}`);
            setOrders((current) => current.filter((item) => item.id !== order.id));
            setNotice(`Pedido #${order.id} excluído.`);
        } catch (cause) {
            setError(errorMessage(cause));
        } finally {
            mutation.current = false;
            setBusy(null);
        }
    }

    return (
        <section className="admin-report admin-orders" aria-labelledby="orders-title">
            <header className="admin-report__header">
                <div>
                    <h2 id="orders-title">Encomendas</h2>
                    <p>Altere o status ou exclua uma encomenda.</p>
                </div>
                <button
                    type="button"
                    className="admin-orders__button admin-orders__refresh"
                    disabled={loading || busy !== null}
                    onClick={() => {
                        setLoading(true);
                        setError('');
                        setNotice('');
                        setRevision((value) => value + 1);
                    }}
                >
                    Atualizar lista
                </button>
            </header>
            {error && (
                <p role="alert" className="admin-report__error">
                    {error}
                </p>
            )}
            {notice && <p role="status">{notice}</p>}
            {loading ? (
                <p role="status">Carregando encomendas…</p>
            ) : (
                <section className="admin-report__card" aria-labelledby="orders-list-title">
                    <div className="admin-report__card-heading">
                        <h3 id="orders-list-title">Todas as encomendas</h3>
                        <p>Do pedido mais recente ao mais antigo.</p>
                    </div>
                    {orders.length === 0 ? (
                        <p className="admin-report__hint">Nenhuma encomenda encontrada.</p>
                    ) : (
                        <div className="admin-report__table-wrapper">
                            <table className="admin-report__table">
                                <caption className="admin-report__sr-only">
                                    Encomendas e ações de gerenciamento
                                </caption>
                                <thead>
                                    <tr>
                                        {[
                                            'Pedido',
                                            'Data',
                                            'Cliente',
                                            'Itens',
                                            'Pagamento',
                                            'Recebimento',
                                            'Status',
                                            'Total',
                                            'Ações',
                                        ].map((title) => (
                                            <th scope="col" key={title}>
                                                {title}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} aria-busy={busy === order.id}>
                                            <th scope="row">#{order.id}</th>
                                            <td>
                                                {dateTimeFormat.format(new Date(order.createdAt))}
                                            </td>
                                            <td>{order.customerName}</td>
                                            <td className="admin-orders__items">
                                                {order.items
                                                    .map(
                                                        (item) =>
                                                            `${item.quantity}x ${item.productName}`,
                                                    )
                                                    .join(', ')}
                                            </td>
                                            <td>{ORDER_PAYMENT_LABELS[order.paymentOption]}</td>
                                            <td>{ORDER_DELIVERY_LABELS[order.deliveryMethod]}</td>
                                            <td>
                                                <select
                                                    aria-label={`Status do pedido #${order.id}`}
                                                    className={`admin-orders__select admin-report__status--${order.status}`}
                                                    value={order.status}
                                                    disabled={busy !== null}
                                                    onChange={(event) =>
                                                        void updateStatus(
                                                            order,
                                                            event.target.value as OrderStatus,
                                                        )
                                                    }
                                                >
                                                    {ORDER_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {ORDER_STATUS_LABELS[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="admin-report__number">
                                                {formatPrice(order.total)}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="admin-orders__button admin-orders__delete"
                                                    aria-label={`Excluir pedido #${order.id}`}
                                                    disabled={busy !== null}
                                                    onClick={() => void deleteOrder(order)}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </section>
    );
}
