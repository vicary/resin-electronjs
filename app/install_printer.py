#!/usr/bin/env python

import cups

conn = cups.Connection()
devices = conn.getDevices()

usb_devices = [device_name for device_name in devices if 'usb' in device_name.lower()]

if len(usb_devices):
    device_name = usb_devices[0]
else:
    print 'No USB printers found'
    exit(1)

printer_name = devices[device_name]['device-info'].replace(' ', '-')

device_id = devices[device_name]['device-id']

print 'Installing USB printer: ', printer_name

# Hardcode experimental driver model Fujifilm
if device_id.find('ASK-300') > -1:
  try:
    ppds = conn.getPPDs(ppd_product='Fujifilm ASK-300')
  except cups.IPPError:
    print 'PPD for ASK-300 not found';
    exit(1)
else:
  try:
    ppds = conn.getPPDs(ppd_device_id=device_id)
  except cups.IPPError:
    print 'No PPD found for this printer'
    exit(1)

ppd = ppds.keys()[0]

conn.addPrinter(name=printer_name, ppdname=ppd, device=device_name)
conn.enablePrinter(printer_name)
conn.acceptJobs(printer_name)
conn.setDefault(printer_name)

# Fujifilm ASK-300 driver in guten print is still experimental
# The printer itself shows as Fujifilm ASK-Printer, but the driver expects Fujifilm ASK-300
#lpadmin -E -p "Fujifilm-ASK-300" -v "usb://FUJIFILM/ASK%20Printer" -P "/usr/share/cups/model/gutenprint/5.2/Global/stp-fujifilm-ask-300.5.2.ppd.gz"
