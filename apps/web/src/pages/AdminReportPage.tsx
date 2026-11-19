import type { OrderReportOrder, OrderReportResponse } from '@cafe-da-fisica/shared';
import { useOrderReport } from '../hooks/useOrderReport';
import { formatPrice } from '../utils/formatPrice';
import {
    ORDER_DELIVERY_LABELS,
    ORDER_PAYMENT_LABELS,
    ORDER_STATUS_LABELS,
} from '../utils/orderLabels';
import './styles/AdminReportPage.css';

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function formatPeriod(from: string, to: string): string {
    return `${dateFormat.format(new Date(from))} a ${dateFormat.format(new Date(to))}`;
}

function formatItems(order: OrderReportOrder): string {
    return order.items.map((item) => `${item.quantity}x ${item.productName}`).join(', ');
}

function LastWeekCard({ lastWeek }: { lastWeek: OrderReportResponse['lastWeek'] }) {
    return (
        <section className="admin-report__card" aria-labelledby="report-last-week-title">
            <div className="admin-report__card-heading">
                <h3 id="report-last-week-title">Última semana</h3>
                <p>
                    {formatPeriod(lastWeek.from, lastWeek.to)}. Pedidos cancelados não entram na
                    conta.
                </p>
            </div>

            <dl className="admin-report__summary">
                <div>
                    <dt>Total arrecadado</dt>
                    <dd>{formatPrice(lastWeek.totalRevenue)}</dd>
                </div>
                <div>
                    <dt>Pedidos</dt>
                    <dd>{lastWeek.ordersCount}</dd>
                </div>
            </dl>

            {lastWeek.products.length === 0 ? (
                <p className="admin-report__hint">
                    Nenhum produto foi encomendado na última semana.
                </p>
            ) : (
                <div className="admin-report__table-wrapper">
                    <table className="admin-report__table">
                        <caption className="admin-report__sr-only">
                            Produtos encomendados na última semana
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">Produto</th>
                                <th scope="col" className="admin-report__number">
                                    Quantidade
                                </th>
                                <th scope="col" className="admin-report__number">
                                    Arrecadado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {lastWeek.products.map((product) => (
                                <tr key={product.productId}>
                                    <th scope="row">{product.productName}</th>
                                    <td className="admin-report__number">{product.quantity}</td>
                                    <td className="admin-report__number">
                                        {formatPrice(product.revenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function HistoryCard({ history }: { history: OrderReportResponse['history'] }) {
    return (
        <section className="admin-report__card" aria-labelledby="report-history-title">
            <div className="admin-report__card-heading">
                <h3 id="report-history-title">Histórico das últimas 4 semanas</h3>
                <p>
                    {formatPeriod(history.from, history.to)}, do pedido mais recente ao mais antigo.
                </p>
            </div>

            {history.orders.length === 0 ? (
                <p className="admin-report__hint">Nenhuma encomenda nas últimas 4 semanas.</p>
            ) : (
                <div className="admin-report__table-wrapper">
                    <table className="admin-report__table">
                        <caption className="admin-report__sr-only">
                            Encomendas das últimas 4 semanas
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">Pedido</th>
                                <th scope="col">Data</th>
                                <th scope="col">Cliente</th>
                                <th scope="col">Itens</th>
                                <th scope="col">Pagamento</th>
                                <th scope="col">Recebimento</th>
                                <th scope="col">Status</th>
                                <th scope="col" className="admin-report__number">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.orders.map((order) => (
                                <tr key={order.id}>
                                    <th scope="row">#{order.id}</th>
                                    <td>{dateTimeFormat.format(new Date(order.createdAt))}</td>
                                    <td>{order.customerName}</td>
                                    <td>{formatItems(order)}</td>
                                    <td>{ORDER_PAYMENT_LABELS[order.paymentOption]}</td>
                                    <td>{ORDER_DELIVERY_LABELS[order.deliveryMethod]}</td>
                                    <td>
                                        <span
                                            className={`admin-report__status admin-report__status--${order.status}`}
                                        >
                                            {ORDER_STATUS_LABELS[order.status]}
                                        </span>
                                    </td>
                                    <td className="admin-report__number">
                                        {formatPrice(order.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

/**
 * UC6: the admin's report. The title is always shown; the cards appear once the data is in.
 * "Imprimir / Salvar PDF" opens the browser's print dialog (which can save as PDF); the print
 * styles in AdminReportPage.css make the printout plain black on white.
 */
export function AdminReportPage() {
    const state = useOrderReport();

    return (
        <section className="admin-report" aria-labelledby="admin-report-title">
            <header className="admin-report__header">
                <div>
                    <h2 id="admin-report-title">Relatório</h2>
                    <p>Encomendas das últimas semanas e o que foi vendido na última.</p>
                    {state.kind === 'ready' && (
                        <p className="admin-report__print-only">
                            Gerado em {dateTimeFormat.format(new Date(state.report.history.to))}
                        </p>
                    )}
                </div>
                <button
                    className="admin-report__print"
                    type="button"
                    disabled={state.kind !== 'ready'}
                    onClick={() => window.print()}
                >
                    Imprimir / Salvar PDF
                </button>
            </header>

            {state.kind === 'loading' && (
                <p className="admin-report__hint" role="status">
                    Carregando relatório…
                </p>
            )}
            {state.kind === 'error' && (
                <p className="admin-report__error" role="alert">
                    {state.message}
                </p>
            )}
            {state.kind === 'ready' && (
                <>
                    <LastWeekCard lastWeek={state.report.lastWeek} />
                    <HistoryCard history={state.report.history} />
                </>
            )}
        </section>
    );
}
