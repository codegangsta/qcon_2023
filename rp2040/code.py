import digitalio
import board
import displayio
import rgbmatrix
import terminalio
import time
import adafruit_display_shapes.rect
import adafruit_display_text.label
import framebufferio

displayio.release_displays()

# Setting up the matrix with the provided pin mappings for a 32x16 matrix with 2-bit color depth
matrix = rgbmatrix.RGBMatrix(
    width=32, height=16,    # Dimensions of the matrix
    bit_depth=2,            # 2-bit color depth
    rgb_pins=[
        board.GP2,  # R1
        board.GP3,  # G1
        board.GP4,  # B1
        board.GP5,  # R2
        board.GP8,  # G2
        board.GP9   # B2
    ],
    addr_pins=[
        board.GP10,  # A
        board.GP16,  # B
        board.GP18,  # C
        # board.GP20,  # D
        # board.GP22,  # e
    ],
    clock_pin=board.GP11,
    latch_pin=board.GP12,
    output_enable_pin=board.GP13
)

display = framebufferio.FramebufferDisplay(matrix, auto_refresh=True)

# Create a display context
group = displayio.Group()
i = 0
text = adafruit_display_text.label.Label(terminalio.FONT, backgound_tight=True, text=str(i), color=0x00FF00, x=0, y=0)
group.append(text)
display.show(group)


while True:
    i += 1
    text.text = str(i)

    # Get text width and height
    text_width = text.bounding_box[2]
    text_height = text.bounding_box[3]

    center_x = (32 - text_width) / 2
    center_y = (28 - text_height) / 2

    text.x = int(center_x)
    text.y = int(center_y)

    time.sleep(1)
