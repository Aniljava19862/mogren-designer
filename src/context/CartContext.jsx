import {createContext,useContext,useEffect,useMemo,useState} from 'react';
const C=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState(()=>JSON.parse(localStorage.getItem('MOGREN_cart')||'[]'));
 useEffect(()=>localStorage.setItem('MOGREN_cart',JSON.stringify(items)),[items]);
 const add=(item)=>setItems(xs=>[...xs,{...item,cartId:crypto.randomUUID()}]);
 const remove=(id)=>setItems(xs=>xs.filter(x=>x.cartId!==id));
 const qty=(id,q)=>setItems(xs=>xs.map(x=>x.cartId===id?{...x,quantity:Math.max(1,q)}:x));
 const clear=()=>setItems([]);
 const subtotal=useMemo(()=>items.reduce((s,x)=>s+x.price*x.quantity,0),[items]);
 return <C.Provider value={{items,add,remove,qty,clear,subtotal}}>{children}</C.Provider>
}
export const useCart=()=>useContext(C);
