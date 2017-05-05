#!/usr/bin/env python

import cups

print 'Autodetecting USB printers...'

conn = cups.Connection()
devices = conn.getDevices()

usb_devices = [device_name for device_name in devices if 'usb' in device_name.lower()]

if len(usb_devices):
    device_name = usb_devices[0]
else:
    print 'No USB printers found'
    exit(1)

printer_name = devices[device_name]['device-info'].replace(' ', '-')

print 'Printer found: ', printer_name

device_id = devices[device_name]['device-id']
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

print 'Done.'
