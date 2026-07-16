import React from 'react';

export default function Profile({ userInfo = {}, onSignOut }) {
  const profile = {
    id: userInfo.id || '',
    fullName: userInfo.fullName || userInfo.username || '',
    email: userInfo.email || '',
    phone: userInfo.phone || '',
    address: userInfo.address || '',
    avatar: userInfo.avatar || '',
    purchaseHistory: Array.isArray(userInfo.purchaseHistory) ? userInfo.purchaseHistory : [],
  };

  const initials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#1e1e24] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#333333] text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.fullName || 'User profile'}</h2>
              <p className="text-sm text-gray-600">Your account details</p>
            </div>
          </div>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Sign out
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Full name</p>
            <p className="mt-1 font-semibold text-gray-900">{profile.fullName}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-semibold text-gray-900">{profile.email}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Phone number</p>
            <p className="mt-1 font-semibold text-gray-900">{profile.phone}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="mt-1 font-semibold text-gray-900">{profile.address}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-gray-200 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900">Purchase history</h3>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {profile.purchaseHistory.length} item(s)
            </span>
          </div>

          {profile.purchaseHistory.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              No purchase records yet. Once your order data is created, it will appear here automatically from MongoDB.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {profile.purchaseHistory.map((item, index) => (
                <li key={`${item.orderCode || item.id || index}-${index}`} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-gray-900">{item.orderCode || `Order ${index + 1}`}</span>
                    <span className="text-xs text-gray-500">{item.date || item.createdAt || 'Saved in MongoDB'}</span>
                  </div>
                  <p className="mt-1">{item.product || item.note || 'Saved order information'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
