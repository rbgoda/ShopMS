import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

interface Shop {
  name: string
  domain: string
  subdomain: string
  logo?: string
  theme?: any
  address?: string
  phone?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  comparePrice?: number
  images: string[]
  category: {
    id: string
    name: string
  }
  inventory: number
  isFeatured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

interface ShopContextType {
  shop: Shop | null
  products: Product[]
  categories: Category[]
  featuredProducts: Product[]
  loading: boolean
  fetchProducts: (filters?: any) => Promise<void>
  fetchProduct: (slug: string) => Promise<Product | null>
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

// Configure axios to use subdomain for API calls
const getSubdomain = () => {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  return parts.length > 2 ? parts[0] : 'demo' // Default to demo for localhost
}

axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.headers.common['X-Tenant-Subdomain'] = getSubdomain()

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShopData()
  }, [])

  const fetchShopData = async () => {
    try {
      const [shopRes, categoriesRes, featuredRes] = await Promise.all([
        axios.get('/public/shop'),
        axios.get('/public/categories'),
        axios.get('/public/products/featured')
      ])
      
      setShop(shopRes.data.shop)
      setCategories(categoriesRes.data.categories)
      setFeaturedProducts(featuredRes.data.products)
    } catch (error) {
      console.error('Failed to fetch shop data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async (filters?: any) => {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.categoryId) params.append('categoryId', filters.categoryId)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await axios.get(`/public/products?${params}`)
      setProducts(response.data.products)
      return response.data
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return { products: [], pagination: {} }
    }
  }

  const fetchProduct = async (slug: string): Promise<Product | null> => {
    try {
      const response = await axios.get(`/public/products/${slug}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return null
    }
  }

  const value = {
    shop,
    products,
    categories,
    featuredProducts,
    loading,
    fetchProducts,
    fetchProduct
  }

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = () => {
  const context = useContext(ShopContext)
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}