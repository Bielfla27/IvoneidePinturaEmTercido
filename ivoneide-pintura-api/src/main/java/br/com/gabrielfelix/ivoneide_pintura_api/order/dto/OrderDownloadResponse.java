package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import br.com.gabrielfelix.ivoneide_pintura_api.order.OrderItem;

public class OrderDownloadResponse {

	private Long produtoId;
	private String produtoNome;
	private String urlPdf;

	public OrderDownloadResponse(OrderItem item) {
		this.produtoId = item.getProduto().getId();
		this.produtoNome = item.getProduto().getNome();
		this.urlPdf = item.getProduto().getUrlPdf();
	}

	public Long getProdutoId() {
		return produtoId;
	}

	public String getProdutoNome() {
		return produtoNome;
	}

	public String getUrlPdf() {
		return urlPdf;
	}
}
