import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export type ExcelRow = {
  jenis: string;
  customer: string;
  tipe_mesin: string;
  nomor_seri: string;
  masalah: string;
  jam_masuk: string;
  jam_keluar: string;
  keterangan: string;
};

export async function exportReportExcel(tanggal: string, teknisi: string, wilayah: string, note: string, rows: ExcelRow[]) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Rental Report";

  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Report");

  sheet.pageSetup = {
    paperSize: 9, // A4

    orientation: "landscape",

    fitToPage: true,

    fitToWidth: 1,

    fitToHeight: 0,

    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
  };
  sheet.columns = [
    { width: 8 }, // No
    { width: 8 }, // Jenis
    { width: 28 }, // Customer
    { width: 12 }, // Type
    { width: 20 }, // Nomor Seri
    { width: 32 }, // Masalah
    { width: 10 }, // Jam In
    { width: 10 }, // Jam Out
    { width: 8 }, // Ket
  ];
  sheet.properties.defaultRowHeight = 22;
  sheet.eachRow((row) => {
    row.font = {
      name: "Calibri",
      size: 11,
    };
  });
  /* ===================================
   TITLE
=================================== */

  sheet.mergeCells("B2:I2");

  const title = sheet.getCell("B2");

  title.value = "JADWAL KUNJUNGAN HARIAN TEKNISI RENTAL";

  title.font = {
    bold: true,
    size: 14,
  };

  title.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  /* ===================================
   HEADER
=================================== */

  // =======================
  // TANGGAL
  // =======================

  sheet.getCell("A4").value = "Tanggal";
  sheet.getCell("B4").value = ":";

  sheet.mergeCells("C4:E4");

  sheet.getCell("C4").value = new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  sheet.getCell("C4").alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  // =======================
  // TEKNISI
  // =======================

  sheet.getCell("A6").value = "Teknisi";
  sheet.getCell("B6").value = ":";

  sheet.mergeCells("C6:E6");

  sheet.getCell("C6").value = teknisi;

  sheet.getCell("C6").alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  // =======================
  // WILAYAH
  // =======================

  sheet.getCell("F6").value = "Wilayah";
  sheet.getCell("G6").value = ":";

  sheet.mergeCells("H6:I6");

  sheet.getCell("H6").value = wilayah;

  sheet.getCell("H6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  sheet.getCell("H6").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
    bottom: { style: "thin" },
  };

  // =======================
  // STYLE
  // =======================

  ["A4", "A6", "F6"].forEach((cell) => {
    sheet.getCell(cell).font = {
      bold: true,
    };
  });

  sheet.getRow(2).height = 28;
  sheet.getRow(4).height = 20;
  sheet.getRow(6).height = 22;
  /* ===================================
   TABLE HEADER
=================================== */

  const headerRow = 8;

  const headers = ["No", "Jenis", "Customer", "Type", "Nomor Seri", "Masalah", "Jam In", "Jam Out", "Ket"];

  headers.forEach((header, index) => {
    const cell = sheet.getCell(headerRow, index + 1);

    cell.value = header;

    cell.font = {
      bold: true,
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "F2F2F2",
      },
    };
  });

  sheet.getRow(headerRow).height = 22;
  /* ===================================
   DATA
=================================== */

  const maxRows = 10;

  for (let i = 0; i < maxRows; i++) {
    const item = rows[i];

    const row = sheet.getRow(headerRow + i + 1);

    row.getCell(1).value = item ? i + 1 : "";

    row.getCell(2).value = item?.jenis ?? "";

    row.getCell(3).value = item?.customer ?? "";

    row.getCell(4).value = item?.tipe_mesin ?? "";

    row.getCell(5).value = item?.nomor_seri ?? "";

    row.getCell(6).value = item?.masalah ?? "";

    row.getCell(7).value = item?.jam_masuk ?? "";

    row.getCell(8).value = item?.jam_keluar ?? "";

    row.getCell(9).value = item?.keterangan ?? "";

    row.height = 22;

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
    });

    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).alignment = { horizontal: "center" };
    row.getCell(7).alignment = { horizontal: "center" };
    row.getCell(8).alignment = { horizontal: "center" };
    row.getCell(9).alignment = { horizontal: "center" };

    row.getCell(3).alignment = {
      wrapText: true,
      vertical: "middle",
    };

    row.getCell(6).alignment = {
      wrapText: true,
      vertical: "middle",
    };
  }
  rows.forEach((_, index) => {
    const row = sheet.getRow(headerRow + index + 1);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
    });
  });
  rows.forEach((_, index) => {
    const row = sheet.getRow(headerRow + index + 1);

    row.getCell(1).alignment = {
      horizontal: "center",
    };

    row.getCell(2).alignment = {
      horizontal: "center",
    };

    row.getCell(4).alignment = {
      horizontal: "center",
    };

    row.getCell(5).alignment = {
      horizontal: "center",
    };

    row.getCell(7).alignment = {
      horizontal: "center",
    };

    row.getCell(8).alignment = {
      horizontal: "center",
    };

    row.getCell(9).alignment = {
      horizontal: "center",
    };
  });
  rows.forEach((_, index) => {
    const row = sheet.getRow(headerRow + index + 1);

    row.getCell(3).alignment = {
      wrapText: true,
      vertical: "middle",
    };

    row.getCell(6).alignment = {
      wrapText: true,
      vertical: "middle",
    };
  });
  /* ===================================
   NOTE
=================================== */

  const noteRow = headerRow + 10 + 2;

  sheet.getCell(`G${noteRow}`).value = "Note :";

  sheet.getCell(`G${noteRow}`).font = {
    bold: true,
  };

  sheet.mergeCells(`G${noteRow + 1}:I${noteRow + 3}`);

  const noteCell = sheet.getCell(`G${noteRow + 1}`);

  noteCell.value = note || "-";

  noteCell.alignment = {
    vertical: "top",
    wrapText: true,
  };

  noteCell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
    bottom: { style: "thin" },
  };
  /* ===================================
   SIGNATURE
=================================== */

  const signRow = noteRow + 1;

  sheet.getCell(`B${signRow}`).value = "Teknisi";
  sheet.getCell(`D${signRow}`).value = "Leader";
  sheet.getCell(`F${signRow}`).value = "Supervisor";

  ["B", "D", "F"].forEach((col) => {
    sheet.getCell(`${col}${signRow}`).font = {
      bold: true,
    };

    sheet.getCell(`${col}${signRow}`).alignment = {
      horizontal: "center",
    };
  });

  const nameRow = signRow + 4;

  sheet.getCell(`B${nameRow}`).value = teknisi;
  sheet.getCell(`D${nameRow}`).value = "Pramono";
  sheet.getCell(`F${nameRow}`).value = "";

  ["B", "D", "F"].forEach((col) => {
    sheet.getCell(`${col}${nameRow}`).alignment = {
      horizontal: "center",
    };
  });
  /* ===================================
   DOWNLOAD
=================================== */

  const buffer = await workbook.xlsx.writeBuffer();

  const tanggalFile = new Date(tanggal)
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");

  saveAs(new Blob([buffer]), `Jadwal Kunjungan ${teknisi}-${tanggalFile}.xlsx`);
}
