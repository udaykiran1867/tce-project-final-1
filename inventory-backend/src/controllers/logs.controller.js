
// import { supabase } from '../config/supabase.js';
// import { generatePDF } from '../utils/generatePDF.js';

// const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// const monthNameToIndex = (name) => {
//   if (!name) return null;
//   const value = name.trim().toLowerCase();
//   const months = {
//     jan: 1,
//     january: 1,
//     feb: 2,
//     february: 2,
//     mar: 3,
//     march: 3,
//     apr: 4,
//     april: 4,
//     may: 5,
//     jun: 6,
//     june: 6,
//     jul: 7,
//     july: 7,
//     aug: 8,
//     august: 8,
//     sep: 9,
//     sept: 9,
//     september: 9,
//     oct: 10,
//     october: 10,
//     nov: 11,
//     november: 11,
//     dec: 12,
//     december: 12,
//   };
//   return months[value] || null;
// };

// const resolveMonthRange = (month, year) => {
//   if (!month) return null;

//   let yearNum = year ? parseInt(year, 10) : null;
//   let monthNum = null;

//   if (String(month).includes('-')) {
//     const [y, m] = String(month).split('-');
//     yearNum = parseInt(y, 10);
//     monthNum = parseInt(m, 10);
//   } else if (String(year).includes('-')) {
//     const [y, m] = String(year).split('-');
//     yearNum = parseInt(y, 10);
//     monthNum = parseInt(m, 10);
//   } else if (/^\d+$/.test(String(month))) {
//     monthNum = parseInt(month, 10);
//   } else {
//     monthNum = monthNameToIndex(month);
//   }

//   if (!yearNum) {
//     yearNum = new Date().getFullYear();
//   }

//   if (!monthNum || Number.isNaN(yearNum)) return null;

//   const startDate = new Date(yearNum, monthNum - 1, 1);
//   const endDate = new Date(yearNum, monthNum, 0);
//   endDate.setHours(23, 59, 59, 999);

//   return { startDate, endDate, year: yearNum, month: monthNum };
// };

// const buildMonthBuckets = (months) => {
//   const now = new Date();
//   const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
//   const buckets = [];

//   for (let i = 0; i < months; i += 1) {
//     const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
//     const key = getMonthKey(d);
//     buckets.push({
//       key,
//       month: d.toLocaleString('en-US', { month: 'long' }),
//       year: d.getFullYear(),
//       monthYear: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`,
//       newlyPurchased: 0,
//       defectiveRemoved: 0,
//       utilizedItems: 0,
//       openingStock: 0,
//       closingStock: 0,
//       transactions: [],
//     });
//   }

//   return buckets;
// };

// export const downloadPDF = async (req, res) => {
//   const { month, year } = req.query;

//   if (!month) {
//     return res.status(400).json({ error: 'Month is required' });
//   }

//   // Parse YYYY-MM format or just MM
//   let startDate, endDate;
//   if (year) {
//     // If year is explicitly provided
//     const [yearNum, monthNum] = year.includes('-') ? year.split('-') : [year, month];
//     startDate = new Date(`${yearNum}-${String(monthNum).padStart(2, '0')}-01`);
//   } else if (month.includes('-')) {
//     // If month is in YYYY-MM format
//     startDate = new Date(`${month}-01`);
//   } else {
//     // Default to current year
//     const now = new Date();
//     startDate = new Date(now.getFullYear(), parseInt(month) - 1, 1);
//   }

//   endDate = new Date(startDate);
//   endDate.setMonth(endDate.getMonth() + 1);
//   endDate.setDate(0);
//   endDate.setHours(23, 59, 59, 999);

//   const { data } = await supabase
//     .from('inventory_logs')
//     .select('*')
//     .gte('created_at', startDate.toISOString())
//     .lte('created_at', endDate.toISOString());

//   generatePDF(data, res, `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`);
// };

// export const getMonthlySummary = async (req, res) => {
//   try {
//     const months = Math.min(Math.max(parseInt(req.query.months || '6', 10), 1), 24);
//     const now = new Date();
    
//     // Calculate proper date range accounting for year transitions
//     const start = new Date(now);
//     start.setMonth(start.getMonth() - months + 1);
//     start.setDate(1);
//     start.setHours(0, 0, 0, 0);
    
//     const end = new Date(now);
//     end.setMonth(end.getMonth() + 1);
//     end.setDate(0);
//     end.setHours(23, 59, 59, 999);

//     const { data: logs, error: logsError } = await supabase
//       .from('inventory_logs')
//       .select('product_id, action_type, quantity_changed, created_at')
//       .gte('created_at', start.toISOString())
//       .lte('created_at', end.toISOString());

//     if (logsError) {
//       return res.status(400).json({ error: logsError.message });
//     }

//     const { data: transactions, error: transactionsError } = await supabase
//       .from('student_transactions')
//       .select('id, product_id, student_name, usn, section, transaction_type, issue_date, return_date, quantity, created_at, products(name)')
//       .gte('created_at', start.toISOString())
//       .lte('created_at', end.toISOString());

//     if (transactionsError) {
//       return res.status(400).json({ error: transactionsError.message });
//     }

//     const { data: stock, error: stockError } = await supabase
//       .from('product_stock')
//       .select('available_count');

//     if (stockError) {
//       return res.status(400).json({ error: stockError.message });
//     }

//     const totalAvailable = (stock || []).reduce(
//       (sum, s) => sum + (s.available_count || 0),
//       0,
//     );

//     const buckets = buildMonthBuckets(months);
//     const bucketMap = new Map(buckets.map((b) => [b.key, b]));
//     const loggedPurchaseMap = new Map();

//     const formatDate = (value) => {
//       if (!value) return '';
//       if (typeof value === 'string' && value.includes('T')) {
//         return value.split('T')[0];
//       }
//       return value;
//     };

//     (transactions || []).forEach((tx) => {
//       const dateValue = tx.issue_date || tx.created_at;
//       const createdAt = new Date(dateValue);
//       const key = getMonthKey(createdAt);
//       const bucket = bucketMap.get(key);
//       if (!bucket) return;

//       bucket.transactions.push({
//         id: tx.id,
//         productName: tx.products?.name || 'Unknown',
//         studentName: tx.student_name || '',
//         usn: tx.usn || '',
//         section: tx.section || '',
//         type: tx.transaction_type === 'borrowed' ? 'borrow' : tx.transaction_type === 'purchased' ? 'purchase' : tx.transaction_type,
//         quantity: tx.quantity || 1,
//         date: formatDate(tx.issue_date || tx.created_at),
//         returnDate: formatDate(tx.return_date),
//       });

//     });

//     (logs || []).forEach((log) => {
//       const createdAt = new Date(log.created_at);
//       const key = getMonthKey(createdAt);
//       const bucket = bucketMap.get(key);
//       if (!bucket) return;

//       const qty = Number(log.quantity_changed || 0);

//       switch (log.action_type) {
//         case 'company_purchase':
//           bucket.newlyPurchased += Math.abs(qty);
//           if (log.product_id) {
//             const mapKey = `${key}:${log.product_id}`;
//             loggedPurchaseMap.set(mapKey, (loggedPurchaseMap.get(mapKey) || 0) + Math.abs(qty));
//           }
//           break;
//         case 'student_borrow':
//         case 'student_purchase':
//           bucket.utilizedItems += Math.abs(qty);
//           break;
//         case 'student_return':
//           bucket.utilizedItems -= Math.abs(qty);
//           if (bucket.utilizedItems < 0) bucket.utilizedItems = 0;
//           break;
//         case 'defective_removed':
//           bucket.defectiveRemoved += Math.abs(qty);
//           break;
//         default:
//           break;
//       }
//     });

//     const { data: products, error: productsError } = await supabase
//       .from('products')
//       .select('id, created_at, product_stock(master_count)');

//     if (productsError) {
//       return res.status(400).json({ error: productsError.message });
//     }

//     (products || []).forEach((product) => {
//       if (!product.created_at) return;
//       const createdAt = new Date(product.created_at);
//       if (Number.isNaN(createdAt.getTime())) return;

//       const key = getMonthKey(createdAt);
//       const bucket = bucketMap.get(key);
//       if (!bucket) return;

//       const masterCount = product.product_stock?.[0]?.master_count || 0;
//       const loggedKey = `${key}:${product.id}`;
//       const loggedAmount = loggedPurchaseMap.get(loggedKey) || 0;

//       if (masterCount > loggedAmount) {
//         bucket.newlyPurchased += Math.max(masterCount - loggedAmount, 0);
//       }
//     });

//     // Calculate forward chronologically (oldest to newest)
//     // This ensures opening balance is 0 when products are first created
//     let runningStock = 0;
//     for (let i = 0; i < buckets.length; i += 1) {
//       const bucket = buckets[i];
//       bucket.openingStock = runningStock;
//       bucket.closingStock = runningStock
//         + bucket.newlyPurchased
//         - bucket.defectiveRemoved
//         - bucket.utilizedItems;
//       if (bucket.closingStock < 0) bucket.closingStock = 0;
//       runningStock = bucket.closingStock;
//     }
//     const result = buckets;

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to build monthly summary' });
//   }
// };

// export const getMonthlyProductReport = async (req, res) => {
//   try {
//     const { month, year } = req.query;
//     const range = resolveMonthRange(month, year);

//     if (!range) {
//       return res.status(400).json({ error: 'Valid month is required' });
//     }

//     const { startDate, endDate } = range;

//     const { data: monthLogs, error: logsError } = await supabase
//       .from('inventory_logs')
//       .select('product_id, action_type, quantity_changed, created_at')
//       .gte('created_at', startDate.toISOString())
//       .lte('created_at', endDate.toISOString());

//     if (logsError) {
//       return res.status(400).json({ error: logsError.message });
//     }

//     const { data: priorLogs, error: priorLogsError } = await supabase
//       .from('inventory_logs')
//       .select('product_id, action_type, quantity_changed, created_at')
//       .lt('created_at', startDate.toISOString());

//     if (priorLogsError) {
//       return res.status(400).json({ error: priorLogsError.message });
//     }

//     const { data: products, error: productsError } = await supabase
//       .from('products')
//       .select('id, name, created_at, product_stock(master_count)');

//     if (productsError) {
//       return res.status(400).json({ error: productsError.message });
//     }

//     const openingMap = new Map();
//     (priorLogs || []).forEach((log) => {
//       const qty = Math.abs(Number(log.quantity_changed || 0));
//       if (!qty) return;
//       let delta = 0;
//       switch (log.action_type) {
//         case 'company_purchase':
//           delta = qty;
//           break;
//         case 'defective_removed':
//           delta = -qty;
//           break;
//         case 'student_borrow':
//         case 'student_purchase':
//           delta = -qty;
//           break;
//         case 'student_return':
//           delta = qty;
//           break;
//         default:
//           return;
//       }
//       const current = openingMap.get(log.product_id) || 0;
//       openingMap.set(log.product_id, current + delta);
//     });

//     const utilizedMap = new Map();

//     const additionsMap = new Map();
//     const scrapMap = new Map();
//     (monthLogs || []).forEach((log) => {
//       const qty = Math.abs(Number(log.quantity_changed || 0));
//       if (log.action_type === 'company_purchase') {
//         const current = additionsMap.get(log.product_id) || 0;
//         additionsMap.set(log.product_id, current + qty);
//       } else if (log.action_type === 'defective_removed') {
//         const current = scrapMap.get(log.product_id) || 0;
//         scrapMap.set(log.product_id, current + qty);
//       } else if (log.action_type === 'student_borrow' || log.action_type === 'student_purchase') {
//         const current = utilizedMap.get(log.product_id) || 0;
//         utilizedMap.set(log.product_id, current + qty);
//       } else if (log.action_type === 'student_return') {
//         const current = utilizedMap.get(log.product_id) || 0;
//         utilizedMap.set(log.product_id, Math.max(current - qty, 0));
//       }
//     });

//     const reportMap = new Map();
//     (products || []).forEach((p) => {
//       const createdAt = p.created_at ? new Date(p.created_at) : null;
//       const createdInRange = createdAt
//         && !Number.isNaN(createdAt.getTime())
//         && createdAt >= startDate
//         && createdAt <= endDate;
//       const masterCount = p.product_stock?.[0]?.master_count || 0;
//       const loggedAdditions = additionsMap.get(p.id) || 0;
//       const additions = createdInRange
//         ? Math.max(loggedAdditions, masterCount)
//         : loggedAdditions;
//       const openingStock = Math.max(0, openingMap.get(p.id) || 0);

//       reportMap.set(p.id, {
//         productId: p.id,
//         productName: p.name,
//         openingStock,
//         additions,
//         scrap: scrapMap.get(p.id) || 0,
//         utilized: utilizedMap.get(p.id) || 0,
//         closingStock: 0,
//       });
//     });

//     const result = Array.from(reportMap.values()).map((row) => {
//       const closingStock = row.openingStock + row.additions - row.scrap - row.utilized;
//       return {
//         productId: row.productId,
//         productName: row.productName,
//         openingStock: row.openingStock,
//         additions: row.additions,
//         scrap: row.scrap,
//         utilized: row.utilized,
//         closingStock: closingStock < 0 ? 0 : closingStock,
//       };
//     });

//     result.sort((a, b) => a.productName.localeCompare(b.productName));

//     res.json({
//       month: range.month,
//       year: range.year,
//       rows: result,
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to build monthly product report' });
//   }
// };

// export const getRecentLogs = async (req, res) => {
//   try {
//     const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 200);
//     const { data: logs, error } = await supabase
//       .from('inventory_logs')
//       .select('id, product_id, action_type, quantity_changed, created_at, reference_id')
//       .order('created_at', { ascending: false })
//       .limit(limit);

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.json(logs || []);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch logs' });
//   }
// };

// export const getDefectiveRemarks = async (req, res) => {
//   try {
//     const limit = Math.min(Math.max(parseInt(req.query.limit || '500', 10), 1), 2000);

//     let logs = [];
//     const { data: logsWithReason, error: logsWithReasonError } = await supabase
//       .from('inventory_logs')
//       .select('id, product_id, quantity_changed, created_at, defect_reason')
//       .eq('action_type', 'defective_removed')
//       .order('created_at', { ascending: false })
//       .limit(limit);

//     if (logsWithReasonError) {
//       const { data: logsFallback, error: logsFallbackError } = await supabase
//         .from('inventory_logs')
//         .select('id, product_id, quantity_changed, created_at')
//         .eq('action_type', 'defective_removed')
//         .order('created_at', { ascending: false })
//         .limit(limit);

//       if (logsFallbackError) {
//         return res.status(400).json({ error: logsFallbackError.message });
//       }

//       logs = logsFallback || [];
//     } else {
//       logs = logsWithReason || [];
//     }

//     // No fallback remarks map needed since we're not storing separate remark logs
//     const fallbackRemarksMap = new Map();

//     const productIds = Array.from(new Set((logs || []).map((log) => log.product_id).filter(Boolean)));
//     let productMap = new Map();

//     if (productIds.length > 0) {
//       const { data: products, error: productsError } = await supabase
//         .from('products')
//         .select('id, name')
//         .in('id', productIds);

//       if (productsError) {
//         return res.status(400).json({ error: productsError.message });
//       }

//       productMap = new Map((products || []).map((product) => [product.id, product.name]));
//     }

//     const rows = (logs || []).map((log) => ({
//       id: log.id,
//       productId: log.product_id,
//       productName: productMap.get(log.product_id) || 'Unknown product',
//       quantity: Math.abs(Number(log.quantity_changed || 0)),
//       remarks: log.defect_reason || fallbackRemarksMap.get(`${log.product_id}|${log.created_at}`) || '',
//       createdAt: log.created_at,
//     }));

//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch defective remarks' });
//   }
// };





import { supabase } from '../config/supabase.js';
import { generatePDF } from '../utils/generatePDF.js';

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthNameToIndex = (name) => {
  if (!name) return null;
  const value = name.trim().toLowerCase();
  const months = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };
  return months[value] || null;
};

const resolveMonthRange = (month, year) => {
  if (!month) return null;

  let yearNum = year ? parseInt(year, 10) : null;
  let monthNum = null;

  if (String(month).includes('-')) {
    const [y, m] = String(month).split('-');
    yearNum = parseInt(y, 10);
    monthNum = parseInt(m, 10);
  } else if (String(year).includes('-')) {
    const [y, m] = String(year).split('-');
    yearNum = parseInt(y, 10);
    monthNum = parseInt(m, 10);
  } else if (/^\d+$/.test(String(month))) {
    monthNum = parseInt(month, 10);
  } else {
    monthNum = monthNameToIndex(month);
  }

  if (!yearNum) {
    yearNum = new Date().getFullYear();
  }

  if (!monthNum || Number.isNaN(yearNum)) return null;

  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate, year: yearNum, month: monthNum };
};

const buildMonthBuckets = (months) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const buckets = [];

  for (let i = 0; i < months; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = getMonthKey(d);
    buckets.push({
      key,
      month: d.toLocaleString('en-US', { month: 'long' }),
      year: d.getFullYear(),
      monthYear: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`,
      newlyPurchased: 0,
      defectiveRemoved: 0,
      utilizedItems: 0,
      openingStock: 0,
      closingStock: 0,
      transactions: [],
    });
  }

  return buckets;
};

export const downloadPDF = async (req, res) => {
  const { month, year } = req.query;

  if (!month) {
    return res.status(400).json({ error: 'Month is required' });
  }

  // Parse YYYY-MM format or just MM
  let startDate, endDate;
  if (year) {
    // If year is explicitly provided
    const [yearNum, monthNum] = year.includes('-') ? year.split('-') : [year, month];
    startDate = new Date(`${yearNum}-${String(monthNum).padStart(2, '0')}-01`);
  } else if (month.includes('-')) {
    // If month is in YYYY-MM format
    startDate = new Date(`${month}-01`);
  } else {
    // Default to current year
    const now = new Date();
    startDate = new Date(now.getFullYear(), parseInt(month) - 1, 1);
  }

  endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);

  const { data } = await supabase
    .from('inventory_logs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  generatePDF(data, res, `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`);
};

export const getMonthlySummary = async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months || '6', 10), 1), 24);
    const now = new Date();
    
    // Calculate proper date range accounting for year transitions
    const start = new Date(now);
    start.setMonth(start.getMonth() - months + 1);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    const { data: logs, error: logsError } = await supabase
      .from('inventory_logs')
      .select('product_id, action_type, quantity_changed, created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (logsError) {
      return res.status(400).json({ error: logsError.message });
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('student_transactions')
      .select('id, product_id, student_name, usn, section, transaction_type, issue_date, return_date, quantity, created_at, products(name)')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (transactionsError) {
      return res.status(400).json({ error: transactionsError.message });
    }

    const { data: stock, error: stockError } = await supabase
      .from('product_stock')
      .select('available_count');

    if (stockError) {
      return res.status(400).json({ error: stockError.message });
    }

    const totalAvailable = (stock || []).reduce(
      (sum, s) => sum + (s.available_count || 0),
      0,
    );

    const buckets = buildMonthBuckets(months);
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    const loggedPurchaseMap = new Map();

    const formatDate = (value) => {
      if (!value) return '';
      if (typeof value === 'string' && value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    };

    (transactions || []).forEach((tx) => {
      const dateValue = tx.issue_date || tx.created_at;
      const createdAt = new Date(dateValue);
      const key = getMonthKey(createdAt);
      const bucket = bucketMap.get(key);
      if (!bucket) return;

      bucket.transactions.push({
        id: tx.id,
        productName: tx.products?.name || 'Unknown',
        studentName: tx.student_name || '',
        usn: tx.usn || '',
        section: tx.section || '',
        type: tx.transaction_type === 'borrowed' ? 'borrow' : tx.transaction_type === 'purchased' ? 'purchase' : tx.transaction_type,
        quantity: tx.quantity || 1,
        date: formatDate(tx.issue_date || tx.created_at),
        returnDate: formatDate(tx.return_date),
      });

    });

    (logs || []).forEach((log) => {
      const createdAt = new Date(log.created_at);
      const key = getMonthKey(createdAt);
      const bucket = bucketMap.get(key);
      if (!bucket) return;

      const qty = Number(log.quantity_changed || 0);

      switch (log.action_type) {
        case 'company_purchase':
          bucket.newlyPurchased += Math.abs(qty);
          if (log.product_id) {
            const mapKey = `${key}:${log.product_id}`;
            loggedPurchaseMap.set(mapKey, (loggedPurchaseMap.get(mapKey) || 0) + Math.abs(qty));
          }
          break;
          case 'master_adjustment':

  if (qty > 0) {

    bucket.newlyPurchased += qty;

  } else {

    bucket.newlyPurchased -= Math.abs(qty);

  }

  break;
        case 'student_borrow':
        case 'student_purchase':
          bucket.utilizedItems += Math.abs(qty);
          break;
        case 'student_return':
          bucket.utilizedItems -= Math.abs(qty);
          if (bucket.utilizedItems < 0) bucket.utilizedItems = 0;
          break;
        case 'defective_removed':
          bucket.defectiveRemoved += Math.abs(qty);
          break;
        default:
          break;
      }
    });

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, created_at, product_stock(master_count)');

    if (productsError) {
      return res.status(400).json({ error: productsError.message });
    }

    (products || []).forEach((product) => {
      if (!product.created_at) return;
      const createdAt = new Date(product.created_at);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = getMonthKey(createdAt);
      const bucket = bucketMap.get(key);
      if (!bucket) return;

      const masterCount = product.product_stock?.[0]?.master_count || 0;
      const loggedKey = `${key}:${product.id}`;
      const loggedAmount = loggedPurchaseMap.get(loggedKey) || 0;

      if (masterCount > loggedAmount) {
        bucket.newlyPurchased += Math.max(masterCount - loggedAmount, 0);
      }
    });

    // Calculate forward chronologically (oldest to newest)
    // This ensures opening balance is 0 when products are first created
    let runningStock = 0;
    for (let i = 0; i < buckets.length; i += 1) {
      const bucket = buckets[i];
      bucket.openingStock = runningStock;
      bucket.closingStock = runningStock
        + bucket.newlyPurchased
        - bucket.defectiveRemoved
        - bucket.utilizedItems;
      if (bucket.closingStock < 0) bucket.closingStock = 0;
      runningStock = bucket.closingStock;
    }
    const result = buckets;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to build monthly summary' });
  }
};

export const getMonthlyProductReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const range = resolveMonthRange(month, year);

    if (!range) {
      return res.status(400).json({ error: 'Valid month is required' });
    }

    const { startDate, endDate } = range;

    const { data: monthLogs, error: logsError } = await supabase
      .from('inventory_logs')
      .select('product_id, action_type, quantity_changed, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (logsError) {
      return res.status(400).json({ error: logsError.message });
    }

    const { data: priorLogs, error: priorLogsError } = await supabase
      .from('inventory_logs')
      .select('product_id, action_type, quantity_changed, created_at')
      .lt('created_at', startDate.toISOString());

    if (priorLogsError) {
      return res.status(400).json({ error: priorLogsError.message });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, created_at, product_stock(master_count)');

    if (productsError) {
      return res.status(400).json({ error: productsError.message });
    }

    const openingMap = new Map();
    (priorLogs || []).forEach((log) => {
      const qty = Math.abs(Number(log.quantity_changed || 0));
      if (!qty) return;
      let delta = 0;
      switch (log.action_type) {
        case 'company_purchase':
          delta = qty;
          break;
          case 'master_adjustment':

  delta = log.quantity_changed;

  break;
        case 'defective_removed':
          delta = -qty;
          break;
        case 'student_borrow':
        case 'student_purchase':
          delta = -qty;
          break;
        case 'student_return':
          delta = qty;
          break;
        default:
          return;
      }
      const current = openingMap.get(log.product_id) || 0;
      openingMap.set(log.product_id, current + delta);
    });

    const utilizedMap = new Map();

    const additionsMap = new Map();
    const scrapMap = new Map();
    (monthLogs || []).forEach((log) => {
      const qty = Math.abs(Number(log.quantity_changed || 0));
      if (log.action_type === 'company_purchase') {
        const current = additionsMap.get(log.product_id) || 0;
        additionsMap.set(log.product_id, current + qty);
      } else if (log.action_type === 'defective_removed') {
        const current = scrapMap.get(log.product_id) || 0;
        scrapMap.set(log.product_id, current + qty);
      } else if (log.action_type === 'student_borrow' || log.action_type === 'student_purchase') {
        const current = utilizedMap.get(log.product_id) || 0;
        utilizedMap.set(log.product_id, current + qty);
      } else if (log.action_type === 'student_return') {
        const current = utilizedMap.get(log.product_id) || 0;
        utilizedMap.set(log.product_id, Math.max(current - qty, 0));
      }
    });

    const reportMap = new Map();
    (products || []).forEach((p) => {
      const createdAt = p.created_at ? new Date(p.created_at) : null;
      const createdInRange = createdAt
        && !Number.isNaN(createdAt.getTime())
        && createdAt >= startDate
        && createdAt <= endDate;
      const masterCount = p.product_stock?.[0]?.master_count || 0;
      const loggedAdditions = additionsMap.get(p.id) || 0;
      const additions = createdInRange
        ? Math.max(loggedAdditions, masterCount)
        : loggedAdditions;
      const openingStock = Math.max(0, openingMap.get(p.id) || 0);

      reportMap.set(p.id, {
        productId: p.id,
        productName: p.name,
        openingStock,
        additions,
        scrap: scrapMap.get(p.id) || 0,
        utilized: utilizedMap.get(p.id) || 0,
        closingStock: 0,
      });
    });

    const result = Array.from(reportMap.values()).map((row) => {
      const closingStock = row.openingStock + row.additions - row.scrap - row.utilized;
      return {
        productId: row.productId,
        productName: row.productName,
        openingStock: row.openingStock,
        additions: row.additions,
        scrap: row.scrap,
        utilized: row.utilized,
        closingStock: closingStock < 0 ? 0 : closingStock,
      };
    });

    result.sort((a, b) => a.productName.localeCompare(b.productName));

    res.json({
      month: range.month,
      year: range.year,
      rows: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to build monthly product report' });
  }
};

export const getRecentLogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 200);
    const { data: logs, error } = await supabase
      .from('inventory_logs')
      .select('id, product_id, action_type, quantity_changed, created_at, reference_id')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(logs || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

export const getDefectiveRemarks = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '500', 10), 1), 2000);

    let logs = [];
    const { data: logsWithReason, error: logsWithReasonError } = await supabase
      .from('inventory_logs')
      .select('id, product_id, quantity_changed, created_at, defect_reason')
      .eq('action_type', 'defective_removed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logsWithReasonError) {
      const { data: logsFallback, error: logsFallbackError } = await supabase
        .from('inventory_logs')
        .select('id, product_id, quantity_changed, created_at')
        .eq('action_type', 'defective_removed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (logsFallbackError) {
        return res.status(400).json({ error: logsFallbackError.message });
      }

      logs = logsFallback || [];
    } else {
      logs = logsWithReason || [];
    }

    // No fallback remarks map needed since we're not storing separate remark logs
    const fallbackRemarksMap = new Map();

    const productIds = Array.from(new Set((logs || []).map((log) => log.product_id).filter(Boolean)));
    let productMap = new Map();

    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      if (productsError) {
        return res.status(400).json({ error: productsError.message });
      }

      productMap = new Map((products || []).map((product) => [product.id, product.name]));
    }

    const rows = (logs || []).map((log) => ({
      id: log.id,
      productId: log.product_id,
      productName: productMap.get(log.product_id) || 'Unknown product',
      quantity: Math.abs(Number(log.quantity_changed || 0)),
      remarks: log.defect_reason || fallbackRemarksMap.get(`${log.product_id}|${log.created_at}`) || '',
      createdAt: log.created_at,
    }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch defective remarks' });
  }
};
