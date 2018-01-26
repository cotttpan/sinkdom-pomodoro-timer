export default function pad(src: number, s: string, len: number) {
    return (s + src).slice(-len)
}
