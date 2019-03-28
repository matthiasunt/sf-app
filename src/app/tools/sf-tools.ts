export function shadeHexColor(color, percent) {
    const f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16,
        G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000
        + (Math.round((t - G) * p) + G) * 0x100
        + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}



export function getContrastColor(hexcolor: string): string {
    if (hexcolor && hexcolor.length > 0) {
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 160) ? 'black' : 'white';
    } else {
        return 'black';
    }
}

export function getFormattedPhoneNumber(phone: string): string {
    let ret = '';
    if (phone && phone.length > -1) {
        if (phone.charAt(3) === '0') {
            ret += phone.substring(3, 7) + ' ' + phone.substring(7, 13);
        } else {
            ret += phone.substring(3, 6) + ' ' + phone.substring(6);
        }
    }
    return ret;
}

export function getBeautifulTimeString(dateString: string, locale: string): string {
    return new Date(dateString).toLocaleString(locale,
        {
            hour: 'numeric',
            minute: 'numeric'
        });
}

export function getBeautifulDateString(dateString: string, locale: string): string {
    const ret = new Date(dateString).toLocaleString(locale,
        {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    return ret.charAt(0).toUpperCase() + ret.slice(1);
}
