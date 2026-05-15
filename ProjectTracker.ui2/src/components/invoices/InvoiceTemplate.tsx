import React from 'react'
import type { Invoice, SystemSettings } from '@/types'

interface InvoiceTemplateProps {
  invoice: Invoice
  settings?: SystemSettings | null
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoice, settings }, ref) => {
    const subtotal = invoice.lineItems.reduce((sum, li) => sum + li.amount, 0)
    const taxAmount = subtotal * (invoice.taxRate / 100)
    const total = subtotal + taxAmount

    const companyName = settings?.companyName || invoice.companyName || 'Your Company'
    const companyAddress = settings?.companyAddress || null

    const formatDate = (dateString?: string | null) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    }

    const fmt = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

    const statusColors: Record<string, string> = {
      Draft: '#64748b',
      Sent:  '#3b82f6',
      Paid:  '#10b981',
    }
    const statusColor = statusColors[invoice.status] ?? '#64748b'

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          fontSize: '13px',
          color: '#1e293b',
          backgroundColor: '#ffffff',
          width: '794px',
          minHeight: '1123px',
          padding: '0',
          boxSizing: 'border-box' as const,
          position: 'relative' as const,
        }}
      >
        {/* Accent header bar */}
        <div style={{ backgroundColor: '#4f46e5', height: '6px', width: '100%' }} />

        <div style={{ padding: '48px 56px' }}>

          {/* Top row: company left, INVOICE right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                {companyName}
              </div>
              {companyAddress && (
                <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {companyAddress}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#4f46e5', letterSpacing: '-1px', lineHeight: 1 }}>
                INVOICE
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>
                #{invoice.invoiceNumber}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '3px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase' as const,
                backgroundColor: `${statusColor}18`,
                color: statusColor,
                border: `1px solid ${statusColor}40`,
              }}>
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Info grid: Bill To + dates */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '40px',
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                Bill To
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {invoice.clientName || 'Valued Client'}
              </div>
              {invoice.clientAddress && (
                <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {invoice.clientAddress}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
                  Invoice Date
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  {formatDate(invoice.createdAt)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
                  Due Date
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
              {invoice.taxRate > 0 && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
                    Tax Rate
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    {invoice.taxRate}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
            <thead>
              <tr style={{ backgroundColor: '#4f46e5' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '4px 0 0 4px' }}>
                  Description
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase', width: '80px' }}>
                  Hours
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase', width: '100px' }}>
                  Rate
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase', width: '110px', borderRadius: '0 4px 4px 0' }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr
                  key={i}
                  style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                >
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#1e293b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>
                    {item.description}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                    {item.hours.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                    {fmt(item.hourlyRate)}/hr
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#1e293b', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                    {fmt(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>{fmt(taxAmount)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 16px',
                marginTop: '8px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#4f46e5',
                borderRadius: '6px',
              }}>
                <span>Total Due</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes / Terms */}
          {invoice.notes && (
            <div style={{
              padding: '20px 24px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '32px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
                Notes / Terms
              </div>
              <div style={{ fontSize: '12px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                {invoice.notes}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {companyName}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Thank you for your business
            </div>
          </div>

        </div>

        {/* Paid watermark */}
        {invoice.status === 'Paid' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-35deg)',
            fontSize: '120px',
            fontWeight: 900,
            color: '#10b98120',
            letterSpacing: '-4px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}>
            PAID
          </div>
        )}
      </div>
    )
  }
)

InvoiceTemplate.displayName = 'InvoiceTemplate'
