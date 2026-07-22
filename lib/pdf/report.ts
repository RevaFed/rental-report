import jsPDF from "jspdf";

export type PdfRow = {
  jenis: string;
  customer: string;
  tipe_mesin: string;
  nomor_seri: string;
  masalah: string;
  jam_masuk: string;
  jam_keluar: string;
  keterangan: string;
};

export async function exportReportPDF(tanggal: string, teknisi: string, wilayah: string, note: string, rows: PdfRow[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  /* ===========================
      KONSTANTA
  =========================== */

  const tanggalFormat = new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const col = {
    no: 10,
    jenis: 10,
    customer: 46,
    type: 20,
    seri: 33,
    masalah: 40,
    jamIn: 11,
    jamOut: 11,
    ket: 8,
  };

  const headerHeight = 6.8;
  const rowHeight = 5.8;

  // Margin kiri & kanan
  const startX = 10;
  const startY = 36;

  // Hitung total lebar tabel
  const totalWidth = col.no + col.jenis + col.customer + col.type + col.seri + col.masalah + col.jamIn + col.jamOut + col.ket;
  const footerY = startY + headerHeight + rowHeight * 11;

  /* ===========================
      HEADER
  =========================== */

  doc.setFont("helvetica", "bold");

  doc.setFontSize(12);

  doc.text("JADWAL KUNJUNGAN HARIAN TEKNISI RENTAL", 105, 12, {
    align: "center",
  });

  doc.setFontSize(10);

  doc.setFont("helvetica", "normal");

  doc.text("Tanggal", 8, 22);
  doc.text(":", 23, 22);
  doc.text(tanggalFormat, 26, 22);

  doc.text("Teknisi", 8, 28);
  doc.text(":", 23, 28);
  doc.text(teknisi, 26, 28);

  doc.text("Wilayah", 145, 22);
  doc.text(":", 160, 22);
  doc.text(wilayah, 163, 22);
  /* ===========================
    HEADER TABEL
=========================== */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);

  let x = startX;

  /* No */
  doc.rect(x, startY, col.no, headerHeight);
  doc.text("No", x + col.no / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  x += col.no;

  /* Jenis */
  doc.rect(x, startY, col.jenis, headerHeight);
  doc.text("Jenis", x + col.jenis / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  x += col.jenis;

  /* Customer */
  doc.rect(x, startY, col.customer, headerHeight);
  doc.text("Customer", x + col.customer / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  x += col.customer;

  /* Type */
  doc.rect(x, startY, col.type, headerHeight);
  doc.text("Type", x + col.type / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  x += col.type;

  /* Nomor Seri */
  doc.rect(x, startY, col.seri, headerHeight);
  doc.setFontSize(7);
  doc.text("Nomor Seri", x + col.seri / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  doc.setFontSize(7.5);
  x += col.seri;

  /* Masalah */
  doc.rect(x, startY, col.masalah, headerHeight);
  doc.text("Masalah", x + col.masalah / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  x += col.masalah;

  /* Jam In */
  doc.rect(x, startY, col.jamIn, headerHeight);
  doc.setFontSize(6.5);
  doc.text("Jam In", x + col.jamIn / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  doc.setFontSize(7.5);
  x += col.jamIn;

  /* Jam Out */
  doc.rect(x, startY, col.jamOut, headerHeight);
  doc.setFontSize(6.5);
  doc.text("Jam Out", x + col.jamOut / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  doc.setFontSize(7.5);
  x += col.jamOut;

  /* Ket */
  doc.rect(x, startY, col.ket, headerHeight);
  doc.text("Ket", x + col.ket / 2, startY + headerHeight / 2 + 1, {
    align: "center",
  });
  /* ===========================
    BODY TABEL
=========================== */

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  for (let i = 0; i < 10; i++) {
    const y = startY + headerHeight + i * rowHeight;

    let x = startX;

    const data = rows[i];

    /* ================= NO ================= */

    doc.rect(x, y, col.no, rowHeight);

    if (data) {
      doc.text(String(i + 1), x + col.no / 2, y + 4.2, {
        align: "center",
      });
    }

    x += col.no;

    /* ================= JENIS ================= */

    doc.rect(x, y, col.jenis, rowHeight);

    if (data) {
      doc.text(data.jenis ?? "", x + col.jenis / 2, y + 4.2, {
        align: "center",
      });
    }

    x += col.jenis;

    /* ================= CUSTOMER ================= */

    doc.rect(x, y, col.customer, rowHeight);

    if (data) {
      doc.setFont("helvetica", "bold");

      doc.text(data.customer ?? "", x + 1.5, y + rowHeight / 2 + 1);

      doc.setFont("helvetica", "normal");
    }

    x += col.customer;

    /* ================= TYPE ================= */

    doc.rect(x, y, col.type, rowHeight);

    if (data) {
      doc.text(data.tipe_mesin ?? "", x + col.type / 2, y + 4.2, {
        align: "center",
      });
    }

    x += col.type;

    /* ================= NOMOR SERI ================= */

    doc.rect(x, y, col.seri, rowHeight);

    if (data) {
      doc.text(data.nomor_seri ?? "", x + col.seri / 2, y + rowHeight / 2 + 1, {
        align: "center",
      });
    }

    x += col.seri;

    /* ================= MASALAH ================= */

    doc.rect(x, y, col.masalah, rowHeight);

    if (data) {
      doc.text(data.masalah ?? "", x + 1.5, y + 4.2);
    }

    x += col.masalah;

    /* ================= JAM IN ================= */

    doc.rect(x, y, col.jamIn, rowHeight);

    if (data) {
      doc.text(data.jam_masuk ?? "", x + col.jamIn / 2, y + 4.2, {
        align: "center",
      });
    }

    x += col.jamIn;

    /* ================= JAM OUT ================= */

    doc.rect(x, y, col.jamOut, rowHeight);

    if (data) {
      doc.text(data.jam_keluar ?? "", x + col.jamOut / 2, y + 4.2, {
        align: "center",
      });
    }

    x += col.jamOut;

    /* ================= KET ================= */

    doc.rect(x, y, col.ket, rowHeight);

    if (data) {
      doc.text(data.keterangan ?? "", x + col.ket / 2, y + 4.2, {
        align: "center",
      });
    }
  }

  /* Border luar */
  doc.rect(startX, startY, totalWidth, headerHeight + rowHeight * 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text("Note :", 155, footerY - 1);

  doc.setFont("helvetica", "normal");

  const noteLines = doc.splitTextToSize(
    note || "-",
    40, // lebar maksimal note (mm)
  );

  doc.text(noteLines, 155, footerY + 3);
  /* ===========================
    FOOTER
=========================== */

  doc.setFont("helvetica", "bold");

  doc.setFontSize(10);

  doc.text("Teknisi", 22, footerY, {
    align: "center",
  });

  doc.text("Leader", 72, footerY, {
    align: "center",
  });

  doc.text("Supervisor", 122, footerY, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");

  doc.setFontSize(9);

  doc.text(teknisi, 28, footerY + 27, {
    align: "center",
  });

  doc.text("Pramono", 73, footerY + 27, {
    align: "center",
  });

  doc.text("", 148, footerY + 27, {
    align: "center",
  });
  doc.save(`Jadwal Kunjungan INDRA-${tanggalFormat}.pdf`);
}
