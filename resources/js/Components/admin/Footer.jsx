import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} PT Citra Konsultama
                        Indonesia. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
