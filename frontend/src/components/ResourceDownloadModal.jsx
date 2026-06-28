import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PlaybookLeadForm from "@/components/PlaybookLeadForm";

// Gated download modal. Hosts the minimal PlaybookLeadForm; the form captures
// name + email, POSTs to /api/playbook-requests, and only then opens the
// asset's Drive download URL. A failed POST blocks the download.
//
// asset: { title, description, downloadUrl, source }
export default function ResourceDownloadModal({ open, onOpenChange, asset }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="resource-download-modal"
        className="max-w-md border-weha-border bg-weha-bg p-0"
      >
        <DialogTitle className="sr-only">{asset ? `Download ${asset.title}` : "Download"}</DialogTitle>
        <DialogDescription className="sr-only">
          Enter your name and email to unlock this download.
        </DialogDescription>
        {asset && (
          <PlaybookLeadForm
            minimal
            heading={asset.title}
            subheading={asset.description}
            source={asset.source}
            assetTitle={asset.title}
            downloadUrl={asset.downloadUrl}
            submitLabel="Get the download"
            testid="resource-gate"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
