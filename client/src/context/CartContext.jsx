import { createContext, useContext, useMemo, useState } from 'react'
const CartContext = createContext(null)
export function CartProvider({ children }) { const [items,setItems]=useState([]); const [open,setOpen]=useState(false); const add=item=>setItems(current=>current.some(x=>x.slug===item.slug)?current:[...current,item]); const remove=slug=>setItems(current=>current.filter(x=>x.slug!==slug)); const value=useMemo(()=>({items,add,remove,open,setOpen,total:items.reduce((sum,item)=>sum+item.price,0)}),[items,open]); return <CartContext.Provider value={value}>{children}</CartContext.Provider> }
export const useCart = () => useContext(CartContext)
