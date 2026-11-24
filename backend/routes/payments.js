// =====================================================================
// HOMIIWRK PAYMENT & ESCROW RECEIPT ROUTE
// Processes receipt generation and dispatches automated Nodemailer emails
// =====================================================================
import express from 'express'
import { sendPaymentReceipt } from '../mailer.js'

const router = express.Router()

// In-memory payment ledger for receipts
const receiptsLedger = []

/**
 * POST /api/payments/receipt
 */
router.post('/receipt', async (req, res) => {
  try {
    const {
      userEmail,
      userName,
      propertyId = 'apex-scholars-haven',
      propertyTitle = 'Apex Prime Studio Suites',
      paymentType = 'Annual Rent Escrow Payment',
      amountFormatted = '₦450,000',
      paymentMethod = 'Debit Card (Paystack Escrow)',
      inspectionPassId = null,
      inspectionDate = null,
      inspectionTime = null
    } = req.body

    const targetEmail = userEmail || 'chisom.okonkwo@gmail.com'
    const targetName = userName || 'Homiiwrk Member'
    const receiptId = `HW-REC-${Math.floor(100000 + Math.random() * 900000)}`

    const receiptEntry = {
      receiptId,
      userEmail: targetEmail,
      userName: targetName,
      propertyId,
      propertyTitle,
      paymentType,
      amountFormatted,
      paymentMethod,
      inspectionPassId,
      inspectionDate,
      inspectionTime,
      createdAt: new Date().toISOString()
    }

    receiptsLedger.push(receiptEntry)

    // Trigger Nodemailer automated receipt email
    const mailResult = await sendPaymentReceipt({
      to: targetEmail,
      userName: targetName,
      receiptId,
      paymentType,
      propertyTitle,
      amountFormatted,
      paymentMethod,
      inspectionPassId,
      inspectionDate,
      inspectionTime
    })

    return res.json({
      success: true,
      receiptId,
      sentTo: targetEmail,
      amountFormatted,
      paymentType,
      mailStatus: mailResult.delivered ? 'delivered' : 'simulated'
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate receipt. Please try again.' })
  }
})

/**
 * GET /api/payments/receipts
 */
router.get('/receipts', (req, res) => {
  const { email } = req.query
  if (email) {
    const filtered = receiptsLedger.filter((r) => r.userEmail.toLowerCase() === email.toLowerCase())
    return res.json({ receipts: filtered })
  }
  return res.json({ receipts: receiptsLedger })
})

export default router
