
// import { supabase } from '../config/supabase.js';

// export const getAllTransactions = async (req, res) => {
//   try {
//     const { data: transactions, error } = await supabase
//       .from('student_transactions')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.json(transactions || []);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const createTransaction = async (req, res) => {
//   try {
//     const body = req.body;

//     if (!body.productId || !body.student_name || !body.transaction_type) {
//       return res.status(400).json({ error: 'Missing required fields: productId, student_name, transaction_type' });
//     }

//     const insertData = {
//       product_id: body.productId,
//       student_name: body.student_name,
//       transaction_type: body.transaction_type,
//     };

//     if (body.usn) insertData.usn = body.usn;
//     if (body.section) insertData.section = body.section;
//     if (body.issue_date) insertData.issue_date = body.issue_date;
//     if (body.phone_number) insertData.phone_number = body.phone_number;
//     if (body.quantity) insertData.quantity = body.quantity;
//     insertData.return_date = body.return_date ? body.return_date : null;

//     const { data: tx, error: txError } = await supabase
//       .from('student_transactions')
//       .insert(insertData)
//       .select()
//       .single();

//     if (txError) {
//       return res.status(400).json({ error: txError.message });
//     }

//     if (!tx) {
//       return res.status(400).json({ error: 'Failed to create transaction' });
//     }

//     const qty = body.quantity || 1;
    
//     if (body.transaction_type === 'borrowed') {
//       const { data: stock, error: stockFetchError } = await supabase
//         .from('product_stock')
//         .select('available_count, master_count')
//         .eq('product_id', body.productId)
//         .single();

//       if (!stockFetchError) {
//         const newAvailable = Math.max(0, (stock.available_count || 0) - qty);
//         await supabase
//           .from('product_stock')
//           .update({ available_count: newAvailable })
//           .eq('product_id', body.productId);
//       }
//     } else if (body.transaction_type === 'purchased') {
//       const { data: stock, error: stockFetchError } = await supabase
//         .from('product_stock')
//         .select('available_count, master_count')
//         .eq('product_id', body.productId)
//         .single();

//       if (!stockFetchError) {
//         const newAvailable = Math.max(0, (stock.available_count || 0) - qty);
//         await supabase
//           .from('product_stock')
//           .update({ available_count: newAvailable })
//           .eq('product_id', body.productId);
//       }
//     }

//     await supabase.from('inventory_logs').insert({
//       product_id: body.productId,
//       action_type:
//         body.transaction_type === 'borrowed'
//           ? 'student_borrow'
//           : 'student_purchase',
//       quantity_changed: -(qty),
//       reference_id: tx.id,
//       created_at: new Date().toISOString(),
//     });

//     res.json({ message: 'Transaction saved', transactionId: tx.id });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const updateTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const body = req.body || {};

//     if (!id) {
//       return res.status(400).json({ error: 'Transaction ID required' });
//     }

//     const { data: tx, error: fetchError } = await supabase
//       .from('student_transactions')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (fetchError) {
//       return res.status(400).json({ error: fetchError.message });
//     }

//     if (!tx) {
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     const hasReturnValue = (value) => value !== null && value !== undefined && value !== '';

//     const oldQty = tx.quantity || 1;
//     const oldType = tx.transaction_type;
//     const oldReturned = hasReturnValue(tx.return_date);

//     const newQty = body.quantity !== undefined ? Number(body.quantity) : oldQty;
//     if (!Number.isFinite(newQty) || newQty <= 0) {
//       return res.status(400).json({ error: 'Quantity must be a positive number' });
//     }

//     const newType = body.transaction_type || oldType;
//     if (newType !== 'borrowed' && newType !== 'purchased') {
//       return res.status(400).json({ error: 'Invalid transaction type' });
//     }

//     const newReturnDate = body.return_date === ''
//       ? null
//       : (body.return_date !== undefined ? body.return_date : tx.return_date);
//     const newReturned = hasReturnValue(newReturnDate);

//     const { data: stock, error: stockFetchError } = await supabase
//       .from('product_stock')
//       .select('available_count, master_count')
//       .eq('product_id', tx.product_id)
//       .single();

//     if (stockFetchError) {
//       return res.status(400).json({ error: stockFetchError.message });
//     }

//     // let baseAvailable = stock?.available_count || 0;
//     // let baseMaster = stock?.master_count || 0;

//     // if (oldType === 'borrowed') {
//     //   if (!oldReturned) {
//     //     baseAvailable += oldQty;
//     //   }
//     // } else if (oldType === 'purchased') {
//     //   baseAvailable += oldQty;
//     // }

//     // let nextAvailable = baseAvailable;
//     // let nextMaster = baseMaster;

//     // if (newType === 'borrowed') {
//     //   nextAvailable -= newQty;
//     //   if (newReturned) {
//     //     nextAvailable += newQty;
//     //   }
//     // } else if (newType === 'purchased') {
//     //   nextAvailable -= newQty;
//     // }
//     let nextAvailable = stock?.available_count || 0;
// let nextMaster = stock?.master_count || 0;


// // REMOVE OLD EFFECT

// if (oldType === 'borrowed') {

//   if (!oldReturned) {

//     nextAvailable += oldQty;

//   }

// }

// else if (oldType === 'purchased') {

//   nextAvailable += oldQty;

// }


// // APPLY NEW EFFECT

// if (newType === 'borrowed') {

//   if (!newReturned) {

//     nextAvailable -= newQty;

//   }

// }

// else if (newType === 'purchased') {

//   nextAvailable -= newQty;

// }

//     if (nextAvailable > nextMaster) {
//       nextAvailable = nextMaster;
//     }

//     if (nextAvailable < 0 || nextMaster < 0) {
//       return res.status(400).json({ error: 'Insufficient stock for this update' });
//     }

//     const { error: stockUpdateError } = await supabase
//       .from('product_stock')
//       .update({ available_count: nextAvailable, master_count: nextMaster })
//       .eq('product_id', tx.product_id);

//     if (stockUpdateError) {
//       return res.status(400).json({ error: stockUpdateError.message });
//     }

//     const updateData = {
//       student_name: body.student_name !== undefined ? body.student_name : tx.student_name,
//       usn: body.usn !== undefined ? body.usn : tx.usn,
//       section: body.section !== undefined ? body.section : tx.section,
//       issue_date: body.issue_date !== undefined ? body.issue_date : tx.issue_date,
//       phone_number: body.phone_number !== undefined ? body.phone_number : tx.phone_number,
//       quantity: newQty,
//       transaction_type: newType,
//       return_date: newReturnDate,
//     };

//     const { error: updateError } = await supabase
//       .from('student_transactions')
//       .update(updateData)
//       .eq('id', id);

//     if (updateError) {
//       return res.status(400).json({ error: updateError.message });
//     }

//     await supabase.from('inventory_logs').insert({
//       product_id: tx.product_id,
//       action_type: 'transaction_updated',
//       quantity_changed: 0,
//       reference_id: id,
//       created_at: new Date().toISOString(),
//     });

//     res.json({ message: 'Transaction updated' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const returnProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: 'Transaction ID required' });
//     }

//     const { data: tx, error: fetchError } = await supabase
//       .from('student_transactions')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (fetchError) {
//       return res.status(400).json({ error: fetchError.message });
//     }

//     if (!tx) {
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     const { error: updateError } = await supabase
//       .from('student_transactions')
//       .update({ return_date: new Date().toISOString() })
//       .eq('id', id);

//     if (updateError) {
//       return res.status(400).json({ error: updateError.message });
//     }

//     if (tx.transaction_type === 'borrowed') {
//       const qty = tx.quantity || 1;
      
//       const { data: stock, error: stockFetchError } = await supabase
//         .from('product_stock')
//         .select('available_count, master_count')
//         .eq('product_id', tx.product_id)
//         .single();

//       if (!stockFetchError) {
//         const newAvailable = (stock.available_count || 0) + qty;
//         await supabase
//           .from('product_stock')
//           .update({ available_count: newAvailable })
//           .eq('product_id', tx.product_id);
//       }
//     }

//     const { error: logError } = await supabase.from('inventory_logs').insert({
//       product_id: tx.product_id,
//       action_type: 'student_return',
//       quantity_changed: tx.quantity || 1,
//       reference_id: id,
//       created_at: new Date().toISOString(),
//     });

//     res.json({ message: 'Returned successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const deleteTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: 'Transaction ID required' });
//     }

//     const { data: tx, error: fetchError } = await supabase
//       .from('student_transactions')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (fetchError) {
//       return res.status(400).json({ error: fetchError.message });
//     }

//     if (!tx) {
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     const qty = tx.quantity || 1;

//     if (tx.transaction_type === 'borrowed') {
//       if (!tx.return_date) {
//         const { data: stock, error: stockFetchError } = await supabase
//           .from('product_stock')
//           .select('available_count')
//           .eq('product_id', tx.product_id)
//           .single();

//         if (!stockFetchError && stock) {
//           const newAvailable = (stock.available_count || 0) + qty;
//           await supabase
//             .from('product_stock')
//             .update({ available_count: newAvailable })
//             .eq('product_id', tx.product_id);
//         }
//       }
//     } else if (tx.transaction_type === 'purchased') {
//       const { data: stock, error: stockFetchError } = await supabase
//         .from('product_stock')
//         .select('available_count, master_count')
//         .eq('product_id', tx.product_id)
//         .single();

//       if (!stockFetchError && stock) {
//         const newAvailable = (stock.available_count || 0) + qty;
//         await supabase
//           .from('product_stock')
//           .update({ available_count: newAvailable })
//           .eq('product_id', tx.product_id);
//       }
//     }

//     const { error: deleteError } = await supabase
//       .from('student_transactions')
//       .delete()
//       .eq('id', id);

//     if (deleteError) {
//       return res.status(400).json({ error: deleteError.message });
//     }

//     await supabase.from('inventory_logs').insert({
//       product_id: tx.product_id,
//       action_type: 'transaction_deleted',
//       quantity_changed: 0,
//       reference_id: id,
//       created_at: new Date().toISOString(),
//     });

//     res.json({ message: 'Transaction deleted' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
import { supabase } from '../config/supabase.js';

export const getAllTransactions = async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('student_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(transactions || []);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const body = req.body;

    if (!body.productId || !body.student_name || !body.transaction_type) {
      return res.status(400).json({ error: 'Missing required fields: productId, student_name, transaction_type' });
    }

    const insertData = {
      product_id: body.productId,
      student_name: body.student_name,
      transaction_type: body.transaction_type,
    };

    if (body.usn) insertData.usn = body.usn;
    if (body.section) insertData.section = body.section;
    if (body.issue_date) insertData.issue_date = body.issue_date;
    if (body.phone_number) insertData.phone_number = body.phone_number;
    if (body.quantity) insertData.quantity = body.quantity;
    insertData.return_date = body.return_date ? body.return_date : null;

    const { data: tx, error: txError } = await supabase
      .from('student_transactions')
      .insert(insertData)
      .select()
      .single();

    if (txError) {
      return res.status(400).json({ error: txError.message });
    }

    if (!tx) {
      return res.status(400).json({ error: 'Failed to create transaction' });
    }

    const qty = body.quantity || 1;
    
    if (body.transaction_type === 'borrowed') {
      const { data: stock, error: stockFetchError } = await supabase
        .from('product_stock')
        .select('available_count, master_count')
        .eq('product_id', body.productId)
        .single();

      if (!stockFetchError) {
        const newAvailable = Math.max(0, (stock.available_count || 0) - qty);
        await supabase
          .from('product_stock')
          .update({ available_count: newAvailable })
          .eq('product_id', body.productId);
      }
    } else if (body.transaction_type === 'purchased') {
      const { data: stock, error: stockFetchError } = await supabase
        .from('product_stock')
        .select('available_count, master_count')
        .eq('product_id', body.productId)
        .single();

      if (!stockFetchError) {
        const newAvailable = Math.max(0, (stock.available_count || 0) - qty);
        await supabase
          .from('product_stock')
          .update({ available_count: newAvailable })
          .eq('product_id', body.productId);
      }
    }

    await supabase.from('inventory_logs').insert({
      product_id: body.productId,
      action_type:
        body.transaction_type === 'borrowed'
          ? 'student_borrow'
          : 'student_purchase',
      quantity_changed: -(qty),
      reference_id: tx.id,
      created_at: new Date().toISOString(),
    });

    res.json({ message: 'Transaction saved', transactionId: tx.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Transaction ID required' });
    }

    const { data: tx, error: fetchError } = await supabase
      .from('student_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const hasReturnValue = (value) => value !== null && value !== undefined && value !== '';

    const oldQty = tx.quantity || 1;
    const oldType = tx.transaction_type;
    const oldReturned = hasReturnValue(tx.return_date);

    const newQty = body.quantity !== undefined ? Number(body.quantity) : oldQty;
    if (!Number.isFinite(newQty) || newQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    const newType = body.transaction_type || oldType;
    if (newType !== 'borrowed' && newType !== 'purchased') {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const newReturnDate = body.return_date === ''
      ? null
      : (body.return_date !== undefined ? body.return_date : tx.return_date);
    const newReturned = hasReturnValue(newReturnDate);

    const { data: stock, error: stockFetchError } = await supabase
      .from('product_stock')
      .select('available_count, master_count')
      .eq('product_id', tx.product_id)
      .single();

    if (stockFetchError) {
      return res.status(400).json({ error: stockFetchError.message });
    }

        let nextAvailable = stock?.available_count || 0;
let nextMaster = stock?.master_count || 0;


// REMOVE OLD EFFECT

if (oldType === 'borrowed') {

  if (!oldReturned) {

    nextAvailable += oldQty;

  }

}

else if (oldType === 'purchased') {

  nextAvailable += oldQty;

}


// APPLY NEW EFFECT

if (newType === 'borrowed') {

  if (!newReturned) {

    nextAvailable -= newQty;

  }

}

else if (newType === 'purchased') {

  nextAvailable -= newQty;

}

    if (nextAvailable > nextMaster) {
      nextAvailable = nextMaster;
    }

    if (nextAvailable < 0 || nextMaster < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this update' });
    }

    const { error: stockUpdateError } = await supabase
      .from('product_stock')
      .update({ available_count: nextAvailable, master_count: nextMaster })
      .eq('product_id', tx.product_id);

    if (stockUpdateError) {
      return res.status(400).json({ error: stockUpdateError.message });
    }

    const updateData = {
      student_name: body.student_name !== undefined ? body.student_name : tx.student_name,
      usn: body.usn !== undefined ? body.usn : tx.usn,
      section: body.section !== undefined ? body.section : tx.section,
      issue_date: body.issue_date !== undefined ? body.issue_date : tx.issue_date,
      phone_number: body.phone_number !== undefined ? body.phone_number : tx.phone_number,
      quantity: newQty,
      transaction_type: newType,
      return_date: newReturnDate,
    };

    const { error: updateError } = await supabase
      .from('student_transactions')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    if (oldReturned && !newReturned && newType === 'borrowed') {

  await supabase.from('inventory_logs').insert({

    product_id: tx.product_id,

    action_type: 'student_borrow',

    quantity_changed: -(newQty),

    reference_id: id,

    created_at: new Date().toISOString(),

  });

}

// return

else if (!oldReturned && newReturned && newType === 'borrowed') {

  await supabase.from('inventory_logs').insert({

    product_id: tx.product_id,

    action_type: 'student_return',

    quantity_changed: newQty,

    reference_id: id,

    created_at: new Date().toISOString(),

  });

}

    res.json({ message: 'Transaction updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const returnProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Transaction ID required' });
    }

    const { data: tx, error: fetchError } = await supabase
      .from('student_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { error: updateError } = await supabase
      .from('student_transactions')
      .update({ return_date: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    if (tx.transaction_type === 'borrowed') {
      const qty = tx.quantity || 1;
      
      const { data: stock, error: stockFetchError } = await supabase
        .from('product_stock')
        .select('available_count, master_count')
        .eq('product_id', tx.product_id)
        .single();

      if (!stockFetchError) {
        const newAvailable = (stock.available_count || 0) + qty;
        await supabase
          .from('product_stock')
          .update({ available_count: newAvailable })
          .eq('product_id', tx.product_id);
          await supabase.from('inventory_logs').insert({

      product_id: tx.product_id,

      action_type: 'student_return',

      quantity_changed: qty,

      reference_id: id,

      created_at: new Date().toISOString(),

    });
      }
    }

    const { error: logError } = await supabase.from('inventory_logs').insert({
      product_id: tx.product_id,
      action_type: 'student_return',
      quantity_changed: tx.quantity || 1,
      reference_id: id,
      created_at: new Date().toISOString(),
    });

    res.json({ message: 'Returned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Transaction ID required' });
    }

    const { data: tx, error: fetchError } = await supabase
      .from('student_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const qty = tx.quantity || 1;

    if (tx.transaction_type === 'borrowed') {
      if (!tx.return_date) {
        const { data: stock, error: stockFetchError } = await supabase
          .from('product_stock')
          .select('available_count')
          .eq('product_id', tx.product_id)
          .single();

        if (!stockFetchError && stock) {
          const newAvailable = (stock.available_count || 0) + qty;
          await supabase
            .from('product_stock')
            .update({ available_count: newAvailable })
            .eq('product_id', tx.product_id);
        }
      }
    } else if (tx.transaction_type === 'purchased') {
      const { data: stock, error: stockFetchError } = await supabase
        .from('product_stock')
        .select('available_count, master_count')
        .eq('product_id', tx.product_id)
        .single();

      if (!stockFetchError && stock) {
        const newAvailable = (stock.available_count || 0) + qty;
        await supabase
          .from('product_stock')
          .update({ available_count: newAvailable })
          .eq('product_id', tx.product_id);
      }
    }

    const { error: deleteError } = await supabase
      .from('student_transactions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    await supabase.from('inventory_logs').insert({
      product_id: tx.product_id,
      action_type: 'transaction_deleted',
      quantity_changed: 0,
      reference_id: id,
      created_at: new Date().toISOString(),
    });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
