"use client";

export type PrintRow = {
  jenis: string;
  customer: string;
  tipe_mesin: string;
  nomor_seri: string;
  masalah: string;
  jam_masuk: string;
  jam_keluar: string;
  keterangan: string;
};

type Props = {
  tanggal: string;
  teknisi: string;
  wilayah: string;
  rows: PrintRow[];
};

export default function ReportPrint({ tanggal, teknisi, wilayah, rows }: Props) {
  return (
    <>
      <style jsx global>{`
        @page {
          size: A5 landscape;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          #print-area {
            width: 100%;
          }
        }
      `}</style>

      <div
        id="print-area"
        style={{
          width: "198mm",
          height: "136mm",
          padding: "3mm",
          overflow: "hidden",
          background: "#fff",
          fontFamily: "Calibri",
          fontSize: "10px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "15px",
            marginBottom: "10px",
          }}
        >
          JADWAL KUNJUNGAN HARIAN TEKNISI RENTAL
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: "70px" }}>Tanggal</td>
              <td style={{ width: "10px" }}>:</td>
              <td>{tanggal}</td>

              <td style={{ width: "40px" }}></td>

              <td style={{ width: "70px" }}>Wilayah</td>
              <td style={{ width: "10px" }}>:</td>
              <td>{wilayah}</td>
            </tr>

            <tr>
              <td>Teknisi</td>
              <td>:</td>
              <td>{teknisi}</td>

              <td></td>

              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* TABEL */}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyleNo}>No</th>

              <th style={thStyleJenis}>Jenis</th>

              <th style={thStyleCustomer}>Customer</th>

              <th style={thStyleType}>Type</th>

              <th style={thStyleSeri}>Nomor Seri</th>

              <th style={thStyleMasalah}>Masalah</th>

              <th style={thStyleJam}>Jam In</th>

              <th style={thStyleJam}>Jam Out</th>

              <th style={thStyleKet}>Ket</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td style={tdCenter}>{index + 1}</td>

                <td style={tdCenter}>{row.jenis}</td>

                <td style={tdLeft}>{row.customer}</td>

                <td style={tdCenter}>{row.tipe_mesin}</td>

                <td style={tdCenter}>{row.nomor_seri}</td>

                <td style={tdLeft}>{row.masalah}</td>

                <td style={tdCenter}>{row.jam_masuk}</td>

                <td style={tdCenter}>{row.jam_keluar}</td>

                <td style={tdCenter}>{row.keterangan}</td>
              </tr>
            ))}

            {/* Tambah baris kosong sampai 10 */}
            {Array.from({
              length: Math.max(0, 10 - rows.length),
            }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td style={emptyCenter}></td>
                <td style={emptyCenter}></td>
                <td style={emptyLeft}></td>
                <td style={emptyCenter}></td>
                <td style={emptyLeft}></td>
                <td style={emptyLeft}></td>
                <td style={emptyCenter}></td>
                <td style={emptyCenter}></td>
                <td style={emptyCenter}></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Jarak bawah tabel */}
        <div
          style={{
            height: "18px",
          }}
        ></div>

        {/* Footer */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: "33%",
                  textAlign: "center",
                  fontWeight: "bold",
                  paddingBottom: "50px",
                }}
              >
                Teknisi
              </td>

              <td
                style={{
                  width: "33%",
                  textAlign: "center",
                  fontWeight: "bold",
                  paddingBottom: "50px",
                }}
              >
                Leader
              </td>

              <td
                style={{
                  width: "33%",
                  textAlign: "center",
                  fontWeight: "bold",
                  paddingBottom: "50px",
                }}
              >
                Supervisor
              </td>
            </tr>

            <tr>
              <td
                style={{
                  textAlign: "center",
                }}
              >
                ({teknisi})
              </td>

              <td
                style={{
                  textAlign: "center",
                }}
              >
                (........................)
              </td>

              <td
                style={{
                  textAlign: "center",
                }}
              >
                (........................)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ========================= */
/* STYLE */
/* ========================= */

const border = "1px solid black";

const thStyleNo = {
  border,
  width: "28px",
  padding: "4px",
};

const thStyleJenis = {
  border,
  width: "45px",
  padding: "4px",
};

const thStyleCustomer = {
  border,
  padding: "4px",
};

const thStyleType = {
  border,
  width: "70px",
  padding: "4px",
};

const thStyleSeri = {
  border,
  width: "110px",
  padding: "4px",
};

const thStyleMasalah = {
  border,
  padding: "4px",
};

const thStyleJam = {
  border,
  width: "55px",
  padding: "4px",
};

const thStyleKet = {
  border,
  width: "45px",
  padding: "4px",
};

const tdCenter = {
  border,
  textAlign: "center" as const,
  padding: "4px",
  height: "24px",
};

const tdLeft = {
  border,
  textAlign: "left" as const,
  padding: "4px",
  height: "24px",
};

const emptyCenter = {
  border,
  height: "24px",
  textAlign: "center" as const,
};

const emptyLeft = {
  border,
  height: "24px",
};
