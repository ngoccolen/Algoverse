import React from 'react'

const ReponsiveMenu = ({ showMenu }) => {
  return (
    <div className={`${showMenu ? "top-20 opacity-100" : "-top-[-100%] opacity-0"} h-auto w-full bg-white/40 backdrop-blur-md fixed top-0 z-40`}>
        <nav className='my-10 text-2xl font-semibold text-center'>
            <ul>
                <li>
                    <a href="#">Trang chủ</a>
                </li>
                <li>
                    <a href="#">Algorithm Lab</a>
                </li>
                <li>
                    <a href="#">Luyện tập</a>
                </li>
                <li>
                    <a href="#">Cộng đồng</a>
                </li>
                <li>
                    <a href="#">BXH</a>
                </li>
            </ul>
        </nav>
    </div>
  )
}

export default ReponsiveMenu
