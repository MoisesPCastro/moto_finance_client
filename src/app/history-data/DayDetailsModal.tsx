// components/history/DayDetailsModal.tsx
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Tooltip } from 'primereact/tooltip';
import { formatDateToDisplay, getDayOfWeekName } from '../../utils/dates';
import { IDayDetails, IEntry } from '../../lib/interface';

interface DayDetailsModalProps {
  dayDetails: IDayDetails | null;
  visible: boolean;
  onHide: () => void;
  onExport?: (format: 'pdf' | 'excel') => void;
}

export function DayDetailsModal({ dayDetails, visible, onHide, onExport }: DayDetailsModalProps) {
  if (!dayDetails) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const gains = dayDetails.entries.filter(e => e.netAmount > 0);
  const expenses = dayDetails.entries.filter(e => e.netAmount < 0);

  const totalGains = gains.reduce((sum, e) => sum + e.netAmount, 0);
  const totalExpenses = Math.abs(expenses.reduce((sum, e) => sum + e.netAmount, 0));

  const highestGain = gains.length > 0 ? Math.max(...gains.map(g => g.grossAmount)) : 0;
  const highestExpense =
    expenses.length > 0 ? Math.max(...expenses.map(e => Math.abs(e.expenses))) : 0;

  const typeBodyTemplate = (rowData: IEntry) => {
    const isGain = rowData.netAmount > 0;
    return (
      <Tag
        value={isGain ? 'GANHO' : 'GASTO'}
        severity={isGain ? 'success' : 'danger'}
        icon={isGain ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-left'}
        rounded
      />
    );
  };

  const amountBodyTemplate = (rowData: IEntry, field: keyof IEntry) => {
    const value = rowData[field] as number;
    const isPositive = value >= 0;
    return (
      <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(value)}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: IEntry) => {
    return (
      <div className="flex flex-col">
        <span className="font-medium">{formatDateToDisplay(rowData.date)}</span>
        <small className="text-gray-500 dark:text-gray-400">{rowData.dayOfWeek}</small>
      </div>
    );
  };

  const categoryBodyTemplate = (rowData: IEntry) => {
    return rowData.category ? (
      <Tag value={rowData.category} severity="info" />
    ) : (
      <span className="text-gray-400 dark:text-gray-500">—</span>
    );
  };

  const headerTemplate = (
    <div className="flex items-center gap-2">
      <i className="pi pi-calendar text-blue-500" />
      <span className="font-bold text-xl text-gray-800 dark:text-white">
        Detalhes do Dia - {formatDateToDisplay(dayDetails.date)}
      </span>
      <Tag value={getDayOfWeekName(dayDetails.date)} severity="info" className="ml-2" />
    </div>
  );

  const footerTemplate = (
    <div className="flex justify-between items-center w-full">
      <Button
        label="Fechar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      />
      <div className="flex gap-2">
        <Button
          label="Exportar PDF"
          icon="pi pi-file-pdf"
          onClick={() => onExport?.('pdf')}
          className="p-button-outlined border-purple-500 text-purple-500 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
        />
        <Button
          label="Exportar Excel"
          icon="pi pi-file-excel"
          onClick={() => onExport?.('excel')}
          className="p-button-outlined border-green-500 text-green-500 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
        />
      </div>
    </div>
  );

  return (
    <>
      <Tooltip target=".p-tag" />

      <Dialog
        header={headerTemplate}
        visible={visible}
        style={{ width: '95vw', maxWidth: '1400px' }}
        footer={footerTemplate}
        onHide={onHide}
        maximizable
        modal
        blockScroll
        dismissableMask
        closeOnEscape
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl"
        contentClassName="overflow-hidden p-0"
      >
        <ScrollPanel style={{ width: '100%', height: '70vh' }}>
          <div className="p-6 space-y-6">
            {/* Cards de Resumo - Estilo igual ao dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Bruto */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <i className="pi pi-arrow-up-right text-blue-500 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Bruto
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {formatCurrency(dayDetails.totalGrossAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <i className="pi pi-check-circle text-green-500"></i>
                    {gains.length} ganhos registrados
                  </span>
                </div>
              </div>

              {/* Total Gastos */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <i className="pi pi-arrow-down-left text-red-500 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Gastos
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {formatCurrency(dayDetails.totalExpenses)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <i className="pi pi-exclamation-circle text-red-500"></i>
                    {expenses.length} gastos registrados
                  </span>
                </div>
              </div>

              {/* Lucro Líquido */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <i className="pi pi-wallet text-green-500 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Lucro Líquido
                    </h3>
                    <p
                      className={`text-2xl font-bold ${dayDetails.totalNetAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(dayDetails.totalNetAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <span
                    className={`flex items-center gap-1 ${dayDetails.totalNetAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <i
                      className={`pi ${dayDetails.totalNetAmount >= 0 ? 'pi-thumbs-up' : 'pi-thumbs-down'}`}
                    ></i>
                    {dayDetails.totalNetAmount >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                  </span>
                </div>
              </div>

              {/* Total Registros */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <i className="pi pi-list text-purple-500 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Registros
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {dayDetails.entriesCount}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tag value={`${gains.length} ganhos`} severity="success" className="text-xs" />
                  <Tag value={`${expenses.length} gastos`} severity="danger" className="text-xs" />
                </div>
              </div>
            </div>

            {/* Observações */}
            {dayDetails.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <i className="pi pi-comment text-amber-500"></i>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Observações do Dia
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 m-0">{dayDetails.description}</p>
              </div>
            )}

            {/* Gráfico e Estatísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Distribuição
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Ganhos</span>
                      <span className="font-bold text-green-600">{formatCurrency(totalGains)}</span>
                    </div>
                    <ProgressBar
                      value={
                        dayDetails.totalGrossAmount > 0
                          ? (totalGains / dayDetails.totalGrossAmount) * 100
                          : 0
                      }
                      showValue={false}
                      style={{ height: '8px' }}
                      className="bg-green-100 dark:bg-green-900/30"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Gastos</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        dayDetails.totalGrossAmount > 0
                          ? (totalExpenses / dayDetails.totalGrossAmount) * 100
                          : 0
                      }
                      showValue={false}
                      style={{ height: '8px' }}
                      className="bg-red-100 dark:bg-red-900/30"
                    />
                  </div>

                  <Divider className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Margem Líquida
                    </span>
                    <Tag
                      value={`${dayDetails.totalGrossAmount > 0 ? ((dayDetails.totalNetAmount / dayDetails.totalGrossAmount) * 100).toFixed(1) : '0'}%`}
                      severity={dayDetails.totalNetAmount >= 0 ? 'success' : 'danger'}
                      icon={
                        dayDetails.totalNetAmount >= 0 ? 'pi pi-thumbs-up' : 'pi pi-thumbs-down'
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <i className="pi pi-chart-bar text-blue-500"></i>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Estatísticas
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                    <i className="pi pi-arrow-up-right text-green-500 text-2xl mb-2"></i>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Maior Ganho</div>
                    <div className="font-bold text-lg text-green-600">
                      {formatCurrency(highestGain)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                    <i className="pi pi-arrow-down-left text-red-500 text-2xl mb-2"></i>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Maior Gasto</div>
                    <div className="font-bold text-lg text-red-600">
                      {formatCurrency(highestExpense)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                    <i className="pi pi-percentage text-blue-500 text-2xl mb-2"></i>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Média/Registro</div>
                    <div className="font-bold text-lg text-gray-800 dark:text-white">
                      {formatCurrency(dayDetails.totalGrossAmount / dayDetails.entriesCount)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                    <i className="pi pi-chart-line text-purple-500 text-2xl mb-2"></i>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Eficiência</div>
                    <Tag
                      value={dayDetails.totalNetAmount >= 0 ? 'Lucrativo' : 'Prejuízo'}
                      severity={dayDetails.totalNetAmount >= 0 ? 'success' : 'danger'}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Registros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-table text-blue-500"></i>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Registros do Dia ({dayDetails.entries.length})
                    </h3>
                  </div>
                  <Button
                    label="Novo Registro"
                    icon="pi pi-plus"
                    size="small"
                    className="p-button-outlined border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  />
                </div>
              </div>

              <div className="p-0">
                <DataTable
                  value={dayDetails.entries}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25]}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                  emptyMessage="Nenhum registro encontrado para este dia"
                  responsiveLayout="scroll"
                  size="small"
                  stripedRows
                  showGridlines
                  className="p-datatable-sm border-0"
                >
                  <Column
                    field="date"
                    header="Data"
                    body={dateBodyTemplate}
                    sortable
                    style={{ minWidth: '120px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                    bodyClassName="text-gray-700 dark:text-gray-300"
                  />
                  <Column
                    field="description"
                    header="Descrição"
                    sortable
                    filter
                    filterPlaceholder="Buscar"
                    style={{ minWidth: '200px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                    bodyClassName="text-gray-700 dark:text-gray-300"
                  />
                  <Column
                    field="grossAmount"
                    header="Valor Bruto"
                    body={rowData => amountBodyTemplate(rowData, 'grossAmount')}
                    sortable
                    style={{ minWidth: '120px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                  />
                  <Column
                    field="expenses"
                    header="Gastos"
                    body={rowData => amountBodyTemplate(rowData, 'expenses')}
                    sortable
                    style={{ minWidth: '120px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                  />
                  <Column
                    field="netAmount"
                    header="Líquido"
                    body={rowData => amountBodyTemplate(rowData, 'netAmount')}
                    sortable
                    style={{ minWidth: '120px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                  />
                  <Column
                    field="category"
                    header="Categoria"
                    body={categoryBodyTemplate}
                    sortable
                    filter
                    filterPlaceholder="Todas"
                    style={{ minWidth: '130px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                  />
                  <Column
                    header="Tipo"
                    body={typeBodyTemplate}
                    sortable
                    sortField="netAmount"
                    style={{ minWidth: '100px' }}
                    headerClassName="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold"
                  />
                </DataTable>
              </div>
            </div>
          </div>
        </ScrollPanel>
      </Dialog>
    </>
  );
}
