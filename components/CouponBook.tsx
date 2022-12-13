import {
  getAssociatedTokenAddress,
  getAccount,
  TokenAccountNotFoundError,
} from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { couponAddress, pointAddress } from '../lib/addresses'

export default function CouponBook() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [couponBalance, setCouponBalance] = useState(0)
  const [pointBalance, setPointBalance] = useState(0)

  async function getCouponBalance() {
    if (!publicKey) {
      setCouponBalance(0)
      setPointBalance(0)
      return
    }

    try {
      const userCouponAddress = await getAssociatedTokenAddress(
        couponAddress,
        publicKey
      )
      const userCouponAccount = await getAccount(connection, userCouponAddress)
      const coupons =
        userCouponAccount.amount > 5 ? 5 : Number(userCouponAccount.amount)

      console.log('coupon is', coupons)
      setCouponBalance(coupons)

      const userPointAddress = await getAssociatedTokenAddress(
        pointAddress,
        publicKey
      )
      const userPointAccount = await getAccount(connection, userPointAddress)
      const points = Number(userPointAccount.amount)

      console.log('point is', points)
      setPointBalance(points)
    } catch (e) {
      if (e instanceof TokenAccountNotFoundError) {
        // This is ok, the API will create one when they make a payment
        console.log(`User ${publicKey} doesn't have a coupon account yet!`)
        setCouponBalance(0)
      } else {
        console.error('Error getting coupon balance', e)
      }
    }
  }

  useEffect(() => {
    getCouponBalance()
  }, [publicKey])

  const notCollected = 5 - couponBalance

  return (
    <>
      <div className="flex flex-col items-center rounded-md bg-gray-900 p-1 text-white">
        <p>
          Collect 5 cookies to receive a 50% discount on your next purchase!
        </p>

        <p className="flex flex-row gap-1 place-self-center">
          {[...Array(couponBalance)].map((_, i) => (
            <span key={i}>🍪</span>
          ))}
          {[...Array(notCollected)].map((_, i) => (
            <span key={i}>⚪</span>
          ))}
        </p>
      </div>

      <div className="flex flex-col items-center rounded-md bg-gray-900 p-1 text-white">
        Point: {pointBalance} EPT
      </div>
    </>
  )
}
