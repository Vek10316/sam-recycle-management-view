const EscPosByteCommands = {
    ALIGN_LEFT: "\x1B\x61\x00",
    ALIGN_CENTER: "\x1B\x61\x01",
    ALIGN_RIGHT: "\x1B\x61\x02",

    TEXT_NORMAL: "\x1B\x21\x00",

    // width x2
    TEXT_DOUBLE_WIDTH: "\x1B\x21\x20",

    // height x2
    TEXT_DOUBLE_HEIGHT: "\x1B\x21\x10",

    // width x2 + height x2
    TEXT_BIG: "\x1B\x21\x30",

    BOLD_ON: "\x1B\x45\x01",
    BOLD_OFF: "\x1B\x45\x00",

    UNDERLINE_ON: "\x1B\x2D\x01",
    UNDERLINE_OFF: "\x1B\x2D\x00",

    INVERT_ON: "\x1D\x42\x01",
    INVERT_OFF: "\x1D\x42\x00",

    /* =========================
     * FONT
     * ========================= */

    FONT_A: "\x1B\x4D\x00",
    FONT_B: "\x1B\x4D\x01",

    /* =========================
     * SPACING / FEED
     * ========================= */

    NEWLINE: "\n",

    FEED_1: "\x1B\x64\x01",
    FEED_2: "\x1B\x64\x02",
    FEED_3: "\x1B\x64\x03",
    FEED_5: "\x1B\x64\x05",

    /* =========================
     * PAPER CUT
     * ========================= */

    CUT_FULL: "\x1D\x56\x00",
    CUT_PARTIAL: "\x1D\x56\x01",

    /* =========================
     * INITIALIZATION
     * ========================= */

    RESET: "\x1B\x40",

    /* =========================
     * CASH DRAWER
     * ========================= */

    DRAWER_KICK: "\x1B\x70\x00\x19\xFA",
} as const;

export default EscPosByteCommands;