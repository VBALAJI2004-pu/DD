import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666666',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  tableCol: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 'auto',
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666666',
  },
});

// Expense PDF Document
export const ExpensePDFDocument = ({ expenses, title, subtitle }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>{subtitle}</Text>
      
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Category</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Sub-Category</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Amount</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Payment Mode</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Attachment</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Remarks</Text>
          </View>
        </View>
        
        {/* Table Rows */}
        {expenses.map((expense, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {expense.date ? new Date(expense.date).toLocaleDateString() : ''}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{expense.category || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{expense.subCategory || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{expense.amount || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{expense.paymentStatus || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{expense.paymentMode || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{expense.attachment ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{expense.remarks || expense.remark || ''}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </Text>
    </Page>
  </Document>
);

// Sales PDF Document
export const SalesPDFDocument = ({ sales, title, subtitle }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>{subtitle}</Text>
      
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Opening Cash</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Purchase Cash</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Online Cash</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Physical Cash</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Cash Transferred</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Closing Cash</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Total Sales</Text>
          </View>
        </View>
        
        {/* Table Rows */}
        {sales.map((sale, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {sale.date ? new Date(sale.date).toLocaleDateString() : ''}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.openingCash || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.purchaseCash || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.onlineCash || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.physicalCash || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.cashTransferred || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.closingCash || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{sale.totalSales || 0}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </Text>
    </Page>
  </Document>
);

// Orders PDF Document
export const OrdersPDFDocument = ({ orders, title, subtitle }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>{subtitle}</Text>
      
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Order Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Delivery Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Order ID</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Amount</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Payment Mode</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Attachment</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Remarks</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
        </View>
        
        {/* Table Rows */}
        {orders.map((order, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : ''}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.orderId || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{order.amount || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.paymentMode || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.attachment ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.remarks || ''}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.status || 'Pending'}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </Text>
    </Page>
  </Document>
);
