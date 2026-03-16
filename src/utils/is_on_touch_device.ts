

export function is_on_touch_device(): boolean
{
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
}
