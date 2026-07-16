import React from 'react';

const defaultUserInfo = {
  name: 'Nguyễn Văn An',
  email: 'an.nguyen@email.com',
  phone: '0901 234 567',
  address: '123 Võ Văn Ngân, Thủ Đức, TP.HCM',
  joinDate: 'Member since 2024',
  points: '1250',
  favoriteItems: ['ASUS Laptop', 'Mechanical keyboard', 'Sony headphones'],
};

export default function Profile({ userInfo, onSignOut }) {
  const profile = {
    ...defaultUserInfo,
    ...userInfo,
    favoriteItems: userInfo?.favoriteItems ?? defaultUserInfo.favoriteItems,
    joinDate: userInfo?.joinDate || defaultUserInfo.joinDate,
    points: userInfo?.points || defaultUserInfo.points,
  };

  const stats = [
    { label: 'Orders', value: '24' },
    { label: 'Paid', value: '18' },
    { label: 'Loyalty points', value: profile.points },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e24] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="w-full rounded-[28px] bg-white p-8 shadow-xl lg:w-[1.1fr]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#333333] text-2xl font-bold text-white">
                {profile.name.split(' ').map((part) => part[0]).join('').toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-600">{profile.joinDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-[#333333] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
                Edit profile
              </button>
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
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-semibold text-gray-900">{userInfo.email}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Phone number</p>
              <p className="mt-1 font-semibold text-gray-900">{userInfo.phone}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4 md:col-span-2">
              <p className="text-sm text-gray-500">Shipping address</p>
              <p className="mt-1 font-semibold text-gray-900">{userInfo.address}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-[0.9fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Statistics</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-[#f5f5f5] p-4">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Favorite products</h3>
            <ul className="mt-4 space-y-3">
              {userInfo.favoriteItems.map((item) => (
                <li key={item} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
