// //feb13
// import { supabase } from '../config/supabase.js';

// export const addProduct = async (req, res) => {
//   try {
//     const { name, description, masterCount, availability, price, imageUrl } = req.body;
//     const masterValueRaw = Number(masterCount);
//     const masterValue = Number.isFinite(masterValueRaw) && masterValueRaw > 0
//       ? masterValueRaw
//       : 0;
//     const availabilityValue = Number(availability);
//     const safeAvailability = Number.isFinite(availabilityValue)
//       ? Math.min(Math.max(availabilityValue, 0), Math.max(masterValue, 0))
//       : Math.max(masterValue, 0);
//     const priceValue = Number(price);
//     const safePrice = Number.isFinite(priceValue) && priceValue >= 0 ? priceValue : 0;

//     const { data: product, error: productError } = await supabase
//       .from('products')
//       .insert({ name, description, image_url: imageUrl || null, price: safePrice })
//       .select()
//       .single();

//     if (productError) {
//       return res.status(400).json({ error: productError.message });
//     }

//     const { error: stockError } = await supabase.from('product_stock').insert({
//       product_id: product.id,
//       master_count: masterValue,
//       available_count: safeAvailability
//     });

//     await supabase.from('inventory_logs').insert({
//       product_id: product.id,
//       action_type: 'company_purchase',
//       quantity_changed: masterValue,
//       created_at: new Date().toISOString(),
//     });

//     const responseData = {
//       id: product.id,
//       name: product.name,
//       description: product.description,
//       price: product.price,
//       imageUrl: product.image_url,
//       masterCount: masterValue,
//       availability: safeAvailability,
//       createdAt: new Date()
//     };

//     res.json(responseData);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add product' });
//   }
// };

// export const getProducts = async (req, res) => {
//   try {
//     const { data } = await supabase
//       .from('products')
//       .select(`
//         id,
//         name,
//         description,
//         price,
//         image_url,
//         product_stock (master_count, available_count)
//       `);

//     const mappedProducts = (data || []).map(product => ({
//       id: product.id,
//       name: product.name,
//       description: product.description,
//       price: product.price,
//       imageUrl: product.image_url,
//       masterCount: product.product_stock?.[0]?.master_count || 0,
//       availability: product.product_stock?.[0]?.available_count || 0,
//       createdAt: new Date()
//     }));

//     res.json(mappedProducts);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// };

// export const updateMaster = async (req, res) => {
//   const { id } = req.params;
//   const { masterCount } = req.body;
//   const quantity = Number(masterCount || 0);

//   if (!id) {
//     return res.status(400).json({ error: 'Product ID is required' });
//   }

//   if (!Number.isFinite(quantity) || quantity <= 0) {
//     return res.status(400).json({ error: 'Quantity must be a positive number' });
//   }

//   const { data: stock, error: stockFetchError } = await supabase
//     .from('product_stock')
//     .select('available_count, master_count')
//     .eq('product_id', id)
//     .single();

//   if (stockFetchError || !stock) {
//     return res.status(400).json({ error: stockFetchError?.message || 'Stock not found' });
//   }

//   const nextMaster = (stock.master_count || 0) + quantity;
//   const nextAvailable = (stock.available_count || 0) + quantity;

//   const { error: updateError } = await supabase
//     .from('product_stock')
//     .update({ master_count: nextMaster, available_count: nextAvailable })
//     .eq('product_id', id);

//   if (updateError) {
//     return res.status(400).json({ error: updateError.message });
//   }

//   await supabase.from('inventory_logs').insert({
//     product_id: id,
//     action_type: 'company_purchase',
//     quantity_changed: quantity,
//     created_at: new Date().toISOString(),
//   });

//   res.json({ message: 'Updated', masterCount: nextMaster, availability: nextAvailable });
// };

// export const markDefective = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { quantity, defectReason } = req.body;
//     const remarks = String(defectReason || '').trim();

//     const removeQty = Number(quantity || 0);

//     if (!id) {
//       return res.status(400).json({ error: 'Product ID is required' });
//     }

//     if (!Number.isFinite(removeQty) || removeQty <= 0) {
//       return res.status(400).json({ error: 'Quantity must be a positive number' });
//     }

//     if (!remarks) {
//       return res.status(400).json({ error: 'Remarks are required for defective items' });
//     }

//     const { data: stock, error: stockFetchError } = await supabase
//       .from('product_stock')
//       .select('available_count, master_count')
//       .eq('product_id', id)
//       .single();

//     if (stockFetchError || !stock) {
//       return res.status(400).json({ error: stockFetchError?.message || 'Stock not found' });
//     }

//     if ((stock.available_count || 0) < removeQty) {
//       return res.status(400).json({ error: 'Insufficient available stock' });
//     }

//     const nextAvailable = (stock.available_count || 0) - removeQty;
//     const nextMaster = stock.master_count || 0;

//     const { error: updateError } = await supabase
//       .from('product_stock')
//       .update({ available_count: nextAvailable })
//       .eq('product_id', id);

//     if (updateError) {
//       return res.status(400).json({ error: updateError.message });
//     }

//     const createdAt = new Date().toISOString();

//     const baseLog = {
//       product_id: id,
//       action_type: 'defective_removed',
//       quantity_changed: -removeQty,
//       created_at: createdAt,
//     };

//     const logWithRemarks = {
//       ...baseLog,
//       defect_reason: remarks,
//     };

//     let remarksStored = true;
//     const { error: logError } = await supabase
//       .from('inventory_logs')
//       .insert(logWithRemarks);

//     if (logError) {
//       const missingColumn = String(logError.message || '').toLowerCase().includes("could not find the 'defect_reason' column");

//       if (!missingColumn) {
//         return res.status(400).json({ error: logError.message });
//       }

//       // defect_reason column doesn't exist, insert log without remarks
//       const { error: fallbackError } = await supabase
//         .from('inventory_logs')
//         .insert(baseLog);

//       if (fallbackError) {
//         return res.status(400).json({ error: fallbackError.message });
//       }

//       remarksStored = false;
//       console.warn('Defect remarks not stored: defect_reason column missing in inventory_logs table');
//     }

//     res.json({ message: 'Defective items removed', masterCount: nextMaster, availability: nextAvailable, remarksStored });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update defective items' });
//   }
// };

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { price, imageUrl, masterCount, availability } = req.body;

//     if (!id) {
//       return res.status(400).json({ error: 'Product ID is required' });
//     }

//     const updateData = {};
//     if (price !== undefined) updateData.price = Number(price) || null;
//     if (imageUrl !== undefined) updateData.image_url = imageUrl || null;

//     const hasStockUpdate = masterCount !== undefined || availability !== undefined;
//     if (Object.keys(updateData).length === 0 && !hasStockUpdate) {
//       return res.status(400).json({ error: 'No fields to update' });
//     }

//     let updatedStock = null;
//     if (hasStockUpdate) {
//       const { data: currentStock, error: stockFetchError } = await supabase
//         .from('product_stock')
//         .select('master_count, available_count')
//         .eq('product_id', id)
//         .single();

//       if (stockFetchError || !currentStock) {
//         return res.status(400).json({ error: stockFetchError?.message || 'Stock not found' });
//       }

//       const nextMaster = masterCount !== undefined ? Number(masterCount) : Number(currentStock.master_count || 0);
//       const nextAvailability = availability !== undefined ? Number(availability) : Number(currentStock.available_count || 0);

//       if (!Number.isFinite(nextMaster) || nextMaster < 0) {
//         return res.status(400).json({ error: 'Master count must be 0 or a positive number' });
//       }

//       if (!Number.isFinite(nextAvailability) || nextAvailability < 0) {
//         return res.status(400).json({ error: 'Availability must be 0 or a positive number' });
//       }

//       if (nextAvailability > nextMaster) {
//         return res.status(400).json({ error: 'Availability cannot exceed master count' });
//       }

//       const { data: stockAfterUpdate, error: stockUpdateError } = await supabase
//         .from('product_stock')
//         .update({
//           master_count: nextMaster,
//           available_count: nextAvailability,
//         })
//         .eq('product_id', id)
//         .select('master_count, available_count')
//         .single();

//       if (stockUpdateError) {
//         return res.status(400).json({ error: stockUpdateError.message });
//       }

//       updatedStock = stockAfterUpdate;
//     }

//     let product = null;
//     if (Object.keys(updateData).length > 0) {
//       const { data: updatedProduct, error } = await supabase
//         .from('products')
//         .update(updateData)
//         .eq('id', id)
//         .select()
//         .single();

//       if (error) {
//         return res.status(400).json({ error: error.message });
//       }

//       product = updatedProduct;
//     } else {
//       const { data: existingProduct, error } = await supabase
//         .from('products')
//         .select('id, price, image_url')
//         .eq('id', id)
//         .single();

//       if (error) {
//         return res.status(400).json({ error: error.message });
//       }

//       product = existingProduct;
//     }

//     res.json({
//       message: 'Product updated successfully',
//       id: product.id,
//       price: product.price,
//       imageUrl: product.image_url,
//       masterCount: updatedStock?.master_count,
//       availability: updatedStock?.available_count,
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update product' });
//   }
// };

// export const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: 'Product ID is required' });
//     }

//     // Delete related inventory logs first
//     await supabase
//       .from('inventory_logs')
//       .delete()
//       .eq('product_id', id);

//     // Delete product stock
//     await supabase
//       .from('product_stock')
//       .delete()
//       .eq('product_id', id);

//     // Delete the product
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.json({ message: 'Product deleted successfully', id });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete product' });
//   }
// };


import { supabase } from '../config/supabase.js';

export const addProduct = async (req, res) => {
  try {
    const { name, description, masterCount, availability, price, imageUrl } = req.body;
    const masterValueRaw = Number(masterCount);
    const masterValue = Number.isFinite(masterValueRaw) && masterValueRaw > 0
      ? masterValueRaw
      : 0;
    const availabilityValue = Number(availability);
    const safeAvailability = Number.isFinite(availabilityValue)
      ? Math.min(Math.max(availabilityValue, 0), Math.max(masterValue, 0))
      : Math.max(masterValue, 0);
    const priceValue = Number(price);
    const safePrice = Number.isFinite(priceValue) && priceValue >= 0 ? priceValue : 0;

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({ name, description, image_url: imageUrl || null, price: safePrice })
      .select()
      .single();

    if (productError) {
      return res.status(400).json({ error: productError.message });
    }

    const { error: stockError } = await supabase.from('product_stock').insert({
      product_id: product.id,
      master_count: masterValue,
      available_count: safeAvailability
    });

    await supabase.from('inventory_logs').insert({
      product_id: product.id,
      action_type: 'company_purchase',
      quantity_changed: masterValue,
      created_at: new Date().toISOString(),
    });

    const responseData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.image_url,
      masterCount: masterValue,
      availability: safeAvailability,
      createdAt: new Date()
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { data } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        product_stock (master_count, available_count)
      `);

    const mappedProducts = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.image_url,
      masterCount: product.product_stock?.[0]?.master_count || 0,
      availability: product.product_stock?.[0]?.available_count || 0,
      createdAt: new Date()
    }));

    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const updateMaster = async (req, res) => {
  const { id } = req.params;
  const { masterCount } = req.body;
  const quantity = Number(masterCount || 0);

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive number' });
  }

  const { data: stock, error: stockFetchError } = await supabase
    .from('product_stock')
    .select('available_count, master_count')
    .eq('product_id', id)
    .single();

  if (stockFetchError || !stock) {
    return res.status(400).json({ error: stockFetchError?.message || 'Stock not found' });
  }

  const nextMaster = (stock.master_count || 0) + quantity;
  const nextAvailable = (stock.available_count || 0) + quantity;

  const { error: updateError } = await supabase
    .from('product_stock')
    .update({ master_count: nextMaster, available_count: nextAvailable })
    .eq('product_id', id);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  await supabase.from('inventory_logs').insert({
    product_id: id,
    action_type: 'company_purchase',
    quantity_changed: quantity,
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Updated', masterCount: nextMaster, availability: nextAvailable });
};

export const markDefective = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, defectReason } = req.body;
    const remarks = String(defectReason || '').trim();

    const removeQty = Number(quantity || 0);

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!Number.isFinite(removeQty) || removeQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    if (!remarks) {
      return res.status(400).json({ error: 'Remarks are required for defective items' });
    }

    const { data: stock, error: stockFetchError } = await supabase
      .from('product_stock')
      .select('available_count, master_count')
      .eq('product_id', id)
      .single();

    if (stockFetchError || !stock) {
      return res.status(400).json({ error: stockFetchError?.message || 'Stock not found' });
    }

    if ((stock.available_count || 0) < removeQty) {
      return res.status(400).json({ error: 'Insufficient available stock' });
    }

    const nextAvailable = (stock.available_count || 0) - removeQty;
    const nextMaster = stock.master_count || 0;

    const { error: updateError } = await supabase
      .from('product_stock')
      .update({ available_count: nextAvailable })
      .eq('product_id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    const createdAt = new Date().toISOString();

    const baseLog = {
      product_id: id,
      action_type: 'defective_removed',
      quantity_changed: -removeQty,
      created_at: createdAt,
    };

    const logWithRemarks = {
      ...baseLog,
      defect_reason: remarks,
    };

    let remarksStored = true;
    const { error: logError } = await supabase
      .from('inventory_logs')
      .insert(logWithRemarks);

    if (logError) {
      const missingColumn = String(logError.message || '').toLowerCase().includes("could not find the 'defect_reason' column");

      if (!missingColumn) {
        return res.status(400).json({ error: logError.message });
      }

      // defect_reason column doesn't exist, insert log without remarks
      const { error: fallbackError } = await supabase
        .from('inventory_logs')
        .insert(baseLog);

      if (fallbackError) {
        return res.status(400).json({ error: fallbackError.message });
      }

      remarksStored = false;
      console.warn('Defect remarks not stored: defect_reason column missing in inventory_logs table');
    }

    res.json({ message: 'Defective items removed', masterCount: nextMaster, availability: nextAvailable, remarksStored });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update defective items' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, imageUrl, masterCount, availability } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const updateData = {};
    if (price !== undefined) updateData.price = Number(price) || null;
    if (imageUrl !== undefined) updateData.image_url = imageUrl || null;

    const hasStockUpdate = masterCount !== undefined || availability !== undefined;
    if (Object.keys(updateData).length === 0 && !hasStockUpdate) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    let updatedStock = null;
    if (hasStockUpdate) {
      const { data: currentStock, error: stockFetchError } = await supabase
        .from('product_stock')
        .select('master_count, available_count')
        .eq('product_id', id)
        .single();

      if (stockFetchError || !currentStock) {
        return res.status(400).json({ error: stockFetchError?.message || 'Stock not found' });
      }

      const nextMaster = masterCount !== undefined ? Number(masterCount) : Number(currentStock.master_count || 0);
      const nextAvailability = availability !== undefined ? Number(availability) : Number(currentStock.available_count || 0);

      if (!Number.isFinite(nextMaster) || nextMaster < 0) {
        return res.status(400).json({ error: 'Master count must be 0 or a positive number' });
      }

      if (!Number.isFinite(nextAvailability) || nextAvailability < 0) {
        return res.status(400).json({ error: 'Availability must be 0 or a positive number' });
      }

      if (nextAvailability > nextMaster) {
        return res.status(400).json({ error: 'Availability cannot exceed master count' });
      }

      const { data: stockAfterUpdate, error: stockUpdateError } = await supabase
        .from('product_stock')
        .update({
          master_count: nextMaster,
          available_count: nextAvailability,
        })
        .eq('product_id', id)
        .select('master_count, available_count')
        .single();

      if (stockUpdateError) {
        return res.status(400).json({ error: stockUpdateError.message });
      }

      updatedStock = stockAfterUpdate;

const masterDiff = nextMaster - (currentStock.master_count || 0);

if (masterDiff !== 0) {

  await supabase.from('inventory_logs').insert({

    product_id: id,

    action_type: 'company_purchase',

    quantity_changed: masterDiff,

    created_at: new Date().toISOString(),

  });

}
    }

    let product = null;
    if (Object.keys(updateData).length > 0) {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      product = updatedProduct;
    } else {
      const { data: existingProduct, error } = await supabase
        .from('products')
        .select('id, price, image_url')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      product = existingProduct;
    }

    res.json({
      message: 'Product updated successfully',
      id: product.id,
      price: product.price,
      imageUrl: product.image_url,
      masterCount: updatedStock?.master_count,
      availability: updatedStock?.available_count,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Delete related inventory logs first
    await supabase
      .from('inventory_logs')
      .delete()
      .eq('product_id', id);

    // Delete product stock
    await supabase
      .from('product_stock')
      .delete()
      .eq('product_id', id);

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
