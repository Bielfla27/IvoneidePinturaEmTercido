package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import br.com.gabrielfelix.ivoneide_pintura_api.order.Order;
import br.com.gabrielfelix.ivoneide_pintura_api.order.OrderStatus;

public class OrderReceiptResponse {

	private Long pedidoId;
	private Long usuarioId;
	private String usuarioNome;
	private String usuarioEmail;
	private OrderStatus status;
	private BigDecimal valorTotal;
	private LocalDateTime dataCompra;
	private List<OrderItemResponse> itens;

	public OrderReceiptResponse(Order order) {
		this.pedidoId = order.getId();
		this.usuarioId = order.getUsuario().getId();
		this.usuarioNome = order.getUsuario().getNome();
		this.usuarioEmail = order.getUsuario().getEmail();
		this.status = order.getStatus();
		this.valorTotal = order.getValorTotal();
		this.dataCompra = order.getCriadoEm();
		this.itens = order.getItens()
				.stream()
				.map(OrderItemResponse::new)
				.toList();
	}

	public Long getPedidoId() {
		return pedidoId;
	}

	public Long getUsuarioId() {
		return usuarioId;
	}

	public String getUsuarioNome() {
		return usuarioNome;
	}

	public String getUsuarioEmail() {
		return usuarioEmail;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public BigDecimal getValorTotal() {
		return valorTotal;
	}

	public LocalDateTime getDataCompra() {
		return dataCompra;
	}

	public List<OrderItemResponse> getItens() {
		return itens;
	}
}
